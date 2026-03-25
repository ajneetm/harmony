/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	VITE_OPENAI_API_KEY
Amplify Params - DO NOT EDIT */

/**
 * AWS Lambda Response Streaming Handler
 * Uses the official streamifyResponse() wrapper for real streaming
 */
exports.handler = awslambda.streamifyResponse(
    async (event, responseStream, context) => {
        console.log(`EVENT: ${JSON.stringify(event)}`);
        
        // Set content type for streaming response
        responseStream.setContentType("text/plain");
        
        try {
            // Get HTTP method - Function URLs use different event structure than API Gateway
            const httpMethod = event.requestContext?.http?.method || event.httpMethod;
            
            // Handle preflight OPTIONS request
            if (httpMethod === 'OPTIONS') {
                responseStream.write('');
                responseStream.end();
                return;
            }

            // Only allow POST requests
            if (httpMethod !== 'POST') {
                responseStream.write(`ERROR: Method not allowed. Received: ${httpMethod}`);
                responseStream.end();
                return;
            }

            const { messages, systemPrompt, stream = true, max_tokens = 1000, response_format } = JSON.parse(event.body);

            // Validate input
            if (!messages || !Array.isArray(messages)) {
                responseStream.write('ERROR: Invalid messages format');
                responseStream.end();
                return;
            }

            // Import OpenAI and AWS SDK
            const { OpenAI } = await import('openai');
            const { SSMClient, GetParameterCommand } = await import('@aws-sdk/client-ssm');
            
            // Get the API key from SSM Parameter Store
            const ssmClient = new SSMClient({ region: process.env.AWS_REGION });
            const parameterName = process.env.VITE_OPENAI_API_KEY;
            
            console.log('Fetching API key from SSM parameter:', parameterName);
            
            const getParameterCommand = new GetParameterCommand({
                Name: parameterName,
                WithDecryption: true
            });
            
            const parameterResponse = await ssmClient.send(getParameterCommand);
            const openaiApiKey = parameterResponse.Parameter.Value;
            
            if (!openaiApiKey) {
                throw new Error('OpenAI API key not found in SSM Parameter Store');
            }
            
            const openai = new OpenAI({
                apiKey: openaiApiKey
            });

            // Filter out error messages and empty messages
            const formattedMessages = messages.filter(
                (msg) =>
                    msg.content.trim() !== '' &&
                    !msg.content.startsWith('Sorry, I encountered an error')
            );

            if (formattedMessages.length === 0) {
                responseStream.write('ERROR: No valid messages to send');
                responseStream.end();
                return;
            }

            // Create the messages array for chat completions
            const chatMessages = [
                ...(systemPrompt?.enabled
                    ? [{ role: 'system', content: systemPrompt.value }]
                    : []),
                ...formattedMessages.map(msg => ({
                    role: msg.role,
                    content: msg.content.trim()
                }))
            ];

            console.log('Starting OpenAI request...', { streaming: stream, maxTokens: max_tokens, responseFormat: response_format });

            // Use OpenAI API with configurable streaming and max_tokens
            const openaiRequest = {
                model: 'gpt-4o-mini',
                messages: chatMessages,
                stream: stream,
                max_tokens: max_tokens,
                temperature: 0.7
            };

            // Add response_format if specified (for JSON mode)
            if (response_format) {
                openaiRequest.response_format = response_format;
            }

            if (stream) {
                // Streaming response
                const streamResponse = await openai.chat.completions.create(openaiRequest);
                
                let hasContent = false;
                
                // Stream each chunk from OpenAI directly to the client
                for await (const chunk of streamResponse) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        hasContent = true;
                        // Write each chunk immediately to the response stream
                        responseStream.write(content);
                    }
                }

                if (!hasContent) {
                    responseStream.write('ERROR: No content received from OpenAI');
                }
            } else {
                // Non-streaming response
                const response = await openai.chat.completions.create(openaiRequest);
                const content = response.choices[0]?.message?.content || '';
                
                if (content) {
                    responseStream.write(content);
                } else {
                    responseStream.write('ERROR: No content received from OpenAI');
                }
            }

            console.log('Streaming completed successfully');
            
            // End the response stream
            responseStream.end();

        } catch (error) {
            console.error('Streaming function failed:', error);
            
            let errorMessage = 'OpenAI API failed';
            if (error instanceof Error) {
                if (error.message.includes('rate limit') || error.message.includes('429')) {
                    errorMessage = 'Rate limit exceeded. Please try again in a moment.';
                } else if (error.message.includes('authentication') || error.message.includes('401')) {
                    errorMessage = 'Authentication failed. Please check your OpenAI API key.';
                } else if (error.message.includes('model') || error.message.includes('400')) {
                    errorMessage = 'Invalid request. The model or parameters may be incorrect.';
                } else {
                    errorMessage = error.message;
                }
            }
            
            try {
                responseStream.write(`ERROR: ${errorMessage}`);
                responseStream.end();
            } catch (streamError) {
                console.error('Error writing to stream:', streamError);
            }
        }
    }
);
