import { GoogleGenAI } from '@google/genai';
import { defer, from, map, catchError, of } from 'rxjs';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export const extractProductData$ = (prompt, textContent = '', model = 'gemini-2.5-flash') => {
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

export const summarizeMarketTrends$ = (items = [], model = 'gemini-2.5-flash') => {
  const prompt = `Analyze the following reseller market data items and summarize key trends, average price point, and resell potential:\n\n${JSON.stringify(items, null, 2)}`;

  return extractProductData$(prompt, '', model);
};
