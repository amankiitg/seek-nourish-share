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

  // Different source sets based on query content
  const allSources = {
    breastfeeding: [
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
    ],
    vitamins: [
      {
        id: 4,
        content: "Water-soluble vitamins include vitamin C and the B-complex vitamins (thiamine, riboflavin, niacin, pantothenic acid, pyridoxine, biotin, folate, and cobalamin). These vitamins are not stored in significant amounts and must be consumed regularly.",
        metadata: { page: 42, source: "micronutrients-guide.pdf" },
        similarity: 0.92
      },
      {
        id: 5,
        content: "Fat-soluble vitamins A, D, E, and K are stored in fatty tissues and the liver. Vitamin D can be synthesized in the skin upon exposure to ultraviolet radiation from sunlight.",
        metadata: { page: 45, source: "micronutrients-guide.pdf" },
        similarity: 0.87
      },
      {
        id: 6,
        content: "Deficiency symptoms vary by vitamin: scurvy for vitamin C, beriberi for thiamine, pellagra for niacin, and rickets for vitamin D in children.",
        metadata: { page: 48, source: "deficiency-disorders.pdf" },
        similarity: 0.81
      }
    ],
    minerals: [
      {
        id: 7,
        content: "Calcium is the most abundant mineral in the human body, with 99% stored in bones and teeth. Daily calcium requirements vary by age, with higher needs during growth periods and for postmenopausal women.",
        metadata: { page: 67, source: "mineral-metabolism.pdf" },
        similarity: 0.88
      },
      {
        id: 8,
        content: "Iron deficiency is the most common nutritional deficiency worldwide. Iron exists in two forms in food: heme iron from animal sources and non-heme iron from plant sources.",
        metadata: { page: 71, source: "mineral-metabolism.pdf" },
        similarity: 0.85
      },
      {
        id: 9,
        content: "Zinc plays crucial roles in immune function, wound healing, and protein synthesis. Good sources include meat, seafood, nuts, and whole grains.",
        metadata: { page: 74, source: "trace-elements.pdf" },
        similarity: 0.82
      }
    ],
    protein: [
      {
        id: 10,
        content: "Complete proteins contain all nine essential amino acids in adequate proportions. Animal proteins are typically complete, while most plant proteins are incomplete.",
        metadata: { page: 28, source: "macronutrients-basics.pdf" },
        similarity: 0.91
      },
      {
        id: 11,
        content: "Protein requirements are based on body weight, with the RDA being 0.8 grams per kilogram of body weight for healthy adults. Athletes and older adults may need more.",
        metadata: { page: 31, source: "protein-requirements.pdf" },
        similarity: 0.86
      },
      {
        id: 12,
        content: "Protein quality is determined by amino acid composition and digestibility. The Protein Digestibility Corrected Amino Acid Score (PDCAAS) is commonly used to assess protein quality.",
        metadata: { page: 35, source: "protein-quality-assessment.pdf" },
        similarity: 0.83
      }
    ],
    carbohydrates: [
      {
        id: 13,
        content: "Carbohydrates are the body's preferred source of energy. They include simple sugars, complex starches, and dietary fiber, each serving different physiological functions.",
        metadata: { page: 52, source: "carbohydrate-metabolism.pdf" },
        similarity: 0.90
      },
      {
        id: 14,
        content: "The glycemic index measures how quickly carbohydrate-containing foods raise blood glucose levels. Low-GI foods provide more sustained energy release.",
        metadata: { page: 55, source: "glycemic-response.pdf" },
        similarity: 0.87
      },
      {
        id: 15,
        content: "Dietary fiber is beneficial for digestive health, blood sugar control, and cholesterol management. The recommended intake is 25-35 grams per day for adults.",
        metadata: { page: 58, source: "fiber-health-benefits.pdf" },
        similarity: 0.84
      }
    ],
    general: [
      {
        id: 16,
        content: "A balanced diet includes appropriate portions from all food groups: fruits, vegetables, grains, protein foods, and dairy or dairy alternatives.",
        metadata: { page: 12, source: "dietary-guidelines.pdf" },
        similarity: 0.78
      },
      {
        id: 17,
        content: "Nutritional needs vary throughout the lifecycle, with specific considerations for pregnancy, lactation, childhood, adolescence, and older adults.",
        metadata: { page: 89, source: "lifecycle-nutrition.pdf" },
        similarity: 0.76
      },
      {
        id: 18,
        content: "Food safety practices are essential to prevent foodborne illness. This includes proper storage, handling, and preparation of foods.",
        metadata: { page: 102, source: "food-safety-handbook.pdf" },
        similarity: 0.73
      }
    ]
  };

  // Determine which sources to use based on message content
  let selectedSources = allSources.general;
  let answer = "";

  if (message.toLowerCase().includes("breastfeed") || message.toLowerCase().includes("infant") || message.toLowerCase().includes("baby")) {
    selectedSources = allSources.breastfeeding;
    answer = "Based on the nutritional guidelines, infants should be breastfed frequently during their early months. [1] The American Academy of Pediatrics recommends exclusive breastfeeding for the first 6 months of life. [2] Breast milk provides optimal nutrition with the perfect combination of proteins, fats, vitamins, and carbohydrates, plus important antibodies for immune protection. [3] Newborns typically need to be fed every 2-3 hours, which equals about 8-12 times per day, though individual needs may vary as babies grow.";
  } else if (message.toLowerCase().includes("vitamin")) {
    selectedSources = allSources.vitamins;
    answer = "Vitamins are essential micronutrients that support various bodily functions. [1] Water-soluble vitamins like vitamin C and B-complex vitamins need regular replenishment as they're not stored in the body. [2] Fat-soluble vitamins (A, D, E, K) are stored in fatty tissues and the liver, with vitamin D uniquely synthesized through sun exposure. [3] Deficiency symptoms are specific to each vitamin and can lead to serious health conditions if left untreated.";
  } else if (message.toLowerCase().includes("mineral") || message.toLowerCase().includes("calcium") || message.toLowerCase().includes("iron") || message.toLowerCase().includes("zinc")) {
    selectedSources = allSources.minerals;
    answer = "Minerals are inorganic substances essential for various bodily functions. [1] Calcium is the most abundant mineral, primarily stored in bones and teeth, with requirements varying by life stage. [2] Iron deficiency is the most common nutritional deficiency globally, with absorption differing between heme and non-heme sources. [3] Zinc supports immune function, wound healing, and protein synthesis, found in meat, seafood, and plant sources.";
  } else if (message.toLowerCase().includes("protein") || message.toLowerCase().includes("amino")) {
    selectedSources = allSources.protein;
    answer = "Proteins are macronutrients composed of amino acids essential for growth and maintenance. [1] Complete proteins contain all nine essential amino acids, typically found in animal sources, while plant proteins are often incomplete. [2] Protein requirements are individualized based on body weight, with the RDA being 0.8g per kg for healthy adults. [3] Protein quality is assessed using methods like PDCAAS, which considers amino acid composition and digestibility.";
  } else if (message.toLowerCase().includes("carbohydrate") || message.toLowerCase().includes("sugar") || message.toLowerCase().includes("fiber") || message.toLowerCase().includes("glucose")) {
    selectedSources = allSources.carbohydrates;
    answer = "Carbohydrates serve as the body's primary energy source and include various forms with different functions. [1] They encompass simple sugars, complex starches, and dietary fiber, each serving unique physiological roles. [2] The glycemic index helps predict blood sugar response, with low-GI foods providing more sustained energy release. [3] Dietary fiber offers multiple health benefits including improved digestion, blood sugar control, and cholesterol management.";
  } else {
    selectedSources = allSources.general;
    answer = `Thank you for your question about "${message}". [1] Based on current nutritional science, a balanced diet should include appropriate portions from all major food groups. [2] Nutritional needs change throughout different life stages, requiring adjustments for optimal health. [3] Food safety practices are also crucial for preventing illness and maintaining nutritional quality.`;
  }

  // Add some randomness to similarity scores to make them more realistic
  const sourcesWithVariedSimilarity = selectedSources.map(source => ({
    ...source,
    similarity: Math.max(0.7, source.similarity + (Math.random() - 0.5) * 0.1)
  }));

  return {
    answer,
    sources: sourcesWithVariedSimilarity
  };
}