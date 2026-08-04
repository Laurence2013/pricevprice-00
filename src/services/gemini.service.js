import { GoogleGenAI } from '@google/genai';
import { defer, from, map, catchError, of } from 'rxjs';
import { loadPromptTemplate } from '../utils/prompt-loader.js';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export const extractProductData$ = (prompt, textContent = '', model = 'gemini-3.6-flash') => {
  const fullPrompt = textContent
    ? `${prompt}\n\nContext Data:\n${textContent}`
    : prompt;

  return defer(() =>
    from(
      ai.models.generateContent({
        model,
        contents: fullPrompt
      })
    )
  ).pipe(
    map((response) => ({
      success: true,
      text: response.text,
      model
    })),
    catchError((error) => of({ success: false, error: error.message }))
  );
};

export const summarizeMarketTrends$ = (items = [], model = 'gemini-3.6-flash') => {
  // Load prompt template from prompts/summarizeMarketTrends.prompt
  const prompt = loadPromptTemplate('summarizeMarketTrends.prompt', { items });

  return extractProductData$(prompt, '', model);
};
