import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("conversations").collect();
  },
});

export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    userId: v.optional(v.string()),
    messages: v.optional(
      v.array(
        v.object({
          id: v.string(),
          role: v.union(v.literal("user"), v.literal("assistant")),
          content: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conversations", {
      title: args.title,
      userId: args.userId,
      messages: args.messages || [],
    });
  },
});

export const listAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("conversations").order("desc").collect();
  },
});

export const saveReport = mutation({
  args: {
    id: v.id("conversations"),
    reportData: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { reportData: args.reportData });
  },
});

export const updateTitle = mutation({
  args: { id: v.id("conversations"), title: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { title: args.title });
  },
});

export const addMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    message: v.object({
      id: v.string(),
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");
    return await ctx.db.patch(args.conversationId, {
      messages: [...conversation.messages, args.message],
    });
  },
});

export const remove = mutation({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
