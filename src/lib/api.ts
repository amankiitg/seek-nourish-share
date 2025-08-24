// API client for the RAG chat functionality
// Since we're using Vite (not Next.js), we'll handle this differently

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  answer: string;
  sources: Array<{
    id: number;
    content: string;
    metadata: { page?: number; source?: string };
    similarity: number;
  }>;
}

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  // For now, we'll create a mock response that simulates the RAG functionality
  // In a real implementation, this would call your backend API
  
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Mock function for development - replace with actual API call
export async function mockChatResponse(message: string): Promise<ChatResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const mockSources = [
    {
      id: 1,
      content: "Breastfeeding provides optimal nutrition for infants during their first six months of life. The American Academy of Pediatrics recommends exclusive breastfeeding for the first 6 months, followed by continued breastfeeding along with appropriate complementary foods for 1 year or longer.",
      metadata: { page: 15, source: "human-nutrition-text.pdf" },
      similarity: 0.89
    },
    {
      id: 2,
      content: "Breast milk contains the perfect combination of proteins, fats, vitamins, and carbohydrates that are easily digestible for babies. It also provides antibodies that help protect infants from infections and diseases.",
      metadata: { page: 16, source: "human-nutrition-text.pdf" },
      similarity: 0.84
    },
    {
      id: 3,
      content: "Infants should be fed every 2-3 hours, or 8-12 times per day during the newborn period. As babies grow, feeding frequency typically decreases but individual needs may vary.",
      metadata: { page: 17, source: "human-nutrition-text.pdf" },
      similarity: 0.79
    }
  ];

  // Generate contextual response based on the question
  let answer = "";
  if (message.toLowerCase().includes("breastfeed") || message.toLowerCase().includes("infant")) {
    answer = "Based on the nutritional guidelines, infants should be breastfed frequently during their early months. [1] The American Academy of Pediatrics recommends exclusive breastfeeding for the first 6 months of life. [2] Breast milk provides optimal nutrition with the perfect combination of proteins, fats, vitamins, and carbohydrates, plus important antibodies for immune protection. [3] Newborns typically need to be fed every 2-3 hours, which equals about 8-12 times per day, though individual needs may vary as babies grow.";
  } else if (message.toLowerCase().includes("vitamin") || message.toLowerCase().includes("mineral")) {
    answer = "Vitamins and minerals are essential micronutrients that support various bodily functions. [1] Water-soluble vitamins like vitamin C and B-complex vitamins need regular replenishment as they're not stored in the body. [2] Fat-soluble vitamins (A, D, E, K) are stored in fatty tissues and the liver. [3] Key minerals include calcium for bone health, iron for oxygen transport, and zinc for immune function. A balanced diet typically provides adequate amounts of these nutrients.";
  } else {
    answer = `Thank you for your question about "${message}". [1] Based on the nutrition textbook content, I can provide evidence-based information about various nutritional topics. [2] The document covers comprehensive information about macronutrients, micronutrients, and their roles in human health. [3] For specific nutritional guidance, it's always best to consult with healthcare professionals who can provide personalized recommendations.`;
  }

  return {
    answer,
    sources: mockSources
  };
}