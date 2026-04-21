import { useStore } from '@tanstack/react-store';
import { v4 as uuidv4 } from 'uuid';
import { actions, selectors, store, type Conversation } from './store';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import type { Message } from '../utils/ai';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Check if Convex URL is provided
const isConvexAvailable = Boolean(import.meta.env.VITE_CONVEX_URL);

// localStorage key for conversations
const CONVERSATIONS_STORAGE_KEY = 'misbara-conversations';

// Helper functions for localStorage
const saveConversationsToStorage = (conversations: Conversation[]) => {
  if (!isConvexAvailable) {
    try {
      localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to save conversations to localStorage:', error);
    }
  }
};

const loadConversationsFromStorage = (): Conversation[] => {
  if (!isConvexAvailable) {
    try {
      const stored = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load conversations from localStorage:', error);
      return [];
    }
  }
  return [];
};

// Original app hook that matches the interface expected by the app
export function useAppState() {
  const isLoading = useStore(store, s => selectors.getIsLoading(s));
  const conversations = useStore(store, s => selectors.getConversations(s));
  const currentConversationId = useStore(store, s => selectors.getCurrentConversationId(s));
  const language = useStore(store, s => selectors.getLanguage(s));
  
  return {
    conversations,
    currentConversationId,
    isLoading,
    language,
    
    // Actions
    setCurrentConversationId: actions.setCurrentConversationId,
    addConversation: actions.addConversation,
    deleteConversation: actions.deleteConversation,
    updateConversationTitle: actions.updateConversationTitle,
    addMessage: actions.addMessage,
    setLoading: actions.setLoading,
    setLanguage: actions.setLanguage,
    
    // Selectors
    getCurrentConversation: selectors.getCurrentConversation,
  };
}

// Hook for Convex integration with fallback to local state
export function useConversations() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  // Local state for UI reactivity
  const conversations = useStore(store, s => selectors.getConversations(s));
  const currentConversationId = useStore(store, s => selectors.getCurrentConversationId(s));
  const currentConversation = useStore(store, s => selectors.getCurrentConversation(s));
  
  // Only fetch Convex conversations for logged-in users (guests use localStorage only)
  const convexConversations = isConvexAvailable
    ? useQuery(api.conversations.listByUser, userId ? { userId } : 'skip') ?? []
    : null;
  
  // Convex mutations (only if Convex is available)
  const createConversation = isConvexAvailable ? useMutation(api.conversations.create) : null;
  const updateTitle = isConvexAvailable ? useMutation(api.conversations.updateTitle) : null;
  const deleteConversation = isConvexAvailable ? useMutation(api.conversations.remove) : null;
  const addMessageToConversation = isConvexAvailable ? useMutation(api.conversations.addMessage) : null;
  
  // Load conversations from localStorage on app startup when Convex is not available
  useEffect(() => {
    if (!isConvexAvailable && conversations.length === 0) {
      const storedConversations = loadConversationsFromStorage();
      if (storedConversations.length > 0) {
        console.log('Loading conversations from localStorage:', storedConversations.length);
        actions.setConversations(storedConversations);
      }
    }
  }, []); // Only run once on mount
  
  // Save conversations to localStorage when they change (only if Convex is not available)
  useEffect(() => {
    if (!isConvexAvailable && conversations.length > 0) {
      saveConversationsToStorage(conversations);
    }
  }, [conversations]);
  
  // Convert Convex conversations to local format if available (logged-in users only)
  useEffect(() => {
    if (isConvexAvailable && userId && convexConversations && convexConversations.length > 0) {
      const formattedConversations: Conversation[] = convexConversations.map(conv => ({
        id: conv._id,
        title: conv.title,
        messages: conv.messages as Message[],
      }));
      
      // Only update conversations if there's a meaningful change
      // Preserve current conversation state during sync
      const currentState = store.getState();
      const currentLocalConversations = currentState.conversations;
      const currentConvId = currentState.currentConversationId;
      
      // Check if we should update - avoid unnecessary overwrites
      const convexIds = new Set(formattedConversations.map(c => c.id));
      const localIds = new Set(currentLocalConversations.map(c => c.id));
      
      // If current conversation exists locally but not in Convex, keep local state
      // This prevents overwriting during new conversation creation
      if (currentConvId && !convexIds.has(currentConvId) && localIds.has(currentConvId)) {
        console.log('Preserving local conversation during Convex sync:', currentConvId);
        return;
      }
      
      actions.setConversations(formattedConversations);
      
      // If current conversation ID is not found in the new conversations, clear it
      if (currentConvId && !convexIds.has(currentConvId)) {
        console.log('Current conversation not found in Convex, clearing currentConversationId');
        actions.setCurrentConversationId(null);
      }
    }
  }, [convexConversations]);
  
  return {
    conversations,
    currentConversationId,
    currentConversation,
    
    setCurrentConversationId: (id: string | null) => {
      actions.setCurrentConversationId(id);
    },
    
    createNewConversation: async (title: string = 'New Conversation') => {
      const id = uuidv4();
      const newConversation: Conversation = {
        id,
        title,
        messages: [],
      };
      
      // First update local state for immediate UI feedback
      actions.addConversation(newConversation);
      
      // Then create in Convex database if available (only for logged-in users)
      if (isConvexAvailable && userId && createConversation) {
        try {
          const convexId = await createConversation({
            title,
            messages: [],
            ...(userId ? { userId } : {}),
          });
          
          // Update the local conversation with the Convex ID
          actions.updateConversationId(id, convexId);
          actions.setCurrentConversationId(convexId);
          
          return convexId;
        } catch (error) {
          console.error('Failed to create conversation in Convex:', error);
        }
      }
      
      // If Convex is not available or there was an error, just use the local ID
      actions.setCurrentConversationId(id);
      return id;
    },
    
    updateConversationTitle: async (id: string, title: string) => {
      // First update local state
      actions.updateConversationTitle(id, title);
      
      // Then update in Convex if available
      if (isConvexAvailable && updateTitle) {
        try {
          await updateTitle({ id: id as Id<'conversations'>, title });
        } catch (error) {
          console.error('Failed to update conversation title in Convex:', error);
        }
      }
    },
    
    deleteConversation: async (id: string) => {
      // First update local state
      actions.deleteConversation(id);
      
      // Then delete from Convex if available
      if (isConvexAvailable && deleteConversation) {
        try {
          await deleteConversation({ id: id as Id<'conversations'> });
        } catch (error) {
          console.error('Failed to delete conversation from Convex:', error);
        }
      }
    },
    
    addMessage: async (conversationId: string, message: Message) => {
      // First update local state
      actions.addMessage(conversationId, message);
      
      // Then add to Convex if available (only for logged-in users)
      if (isConvexAvailable && userId && addMessageToConversation) {
        try {
          await addMessageToConversation({
            conversationId: conversationId as Id<'conversations'>,
            message,
          });
        } catch (error) {
          console.error('Failed to add message to Convex:', error);
        }
      }
    },

    // Additional helper functions for localStorage management
    clearAllConversations: () => {
      actions.setConversations([]);
      actions.setCurrentConversationId(null);
      if (!isConvexAvailable) {
        localStorage.removeItem(CONVERSATIONS_STORAGE_KEY);
      }
    },
    
    refreshFromStorage: () => {
      if (!isConvexAvailable) {
        const storedConversations = loadConversationsFromStorage();
        actions.setConversations(storedConversations);
      }
    }
  };
}