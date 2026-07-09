export interface AISafetySetting {
  category: string;
  threshold: string;
}

export interface AIConfig {
  modelName: string;
  temperature: number;
  topP: number;
  topK: number;
  maxOutputTokens: number;
  safetySettings: AISafetySetting[];
}

/**
 * Enterprise AI Configuration parameters.
 * Supports switching models dynamically through environment variables.
 */
export const aiConfig: AIConfig = {
  modelName: process.env.GEMINI_MODEL_NAME || 'gemini-1.5-flash',
  temperature: 0.2, // Lower temperature to minimize text hallucinations
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  ],
};

export default aiConfig;
