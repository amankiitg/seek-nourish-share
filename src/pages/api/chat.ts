// Vite/Express-style API route for handling chat requests
import { createClient } from '@supabase/supabase-js';

interface ChatRequest {
  message: string;
}

interface ChatResponse {
  answer: string;
  sources: Array<{
    id: number;
    content: string;
    metadata: { page?: number; source?: string };
    similarity: number;
  }>;
}

export async function handleChatRequest(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message }: ChatRequest = req.body;

    // Initialize Supabase client
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!supabaseUrl || !supabaseKey || !openaiApiKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create embedding for the user's message
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: message,
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error('Failed to create embedding');
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Search for similar documents
    const { data: searchResults, error: searchError } = await supabase
      .rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_count: 5,
        filter: { source: 'human-nutrition-text.pdf' }
      });

    if (searchError) {
      throw new Error(`Search error: ${searchError.message}`);
    }

    // Prepare context from retrieved documents
    const context = searchResults
      .map((result: any, index: number) => 
        `[${index + 1}] Page ${result.metadata?.page || '?'}: ${result.content}`
      )
      .join('\n\n');

    // Create prompt for GPT
    const prompt = `You are a helpful nutrition expert assistant. Answer the following question based on the provided context from a nutrition textbook. Use the source citations [1], [2], etc. when referencing specific information.

Context:
${context}

Question: ${message}

Instructions:
- Provide a comprehensive and accurate answer based on the context
- Use citation numbers [1], [2], etc. when referencing specific sources
- If the context doesn't contain enough information, say so
- Focus on being helpful and educational
- Keep the response conversational but informative

Answer:`;

    // Get response from OpenAI
    const completionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!completionResponse.ok) {
      throw new Error('Failed to get completion from OpenAI');
    }

    const completionData = await completionResponse.json();
    const answer = completionData.choices[0].message.content;

    const response: ChatResponse = {
      answer,
      sources: searchResults || [],
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}