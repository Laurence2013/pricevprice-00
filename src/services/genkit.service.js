import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { defer, from, map, catchError, of } from 'rxjs';
import { z } from 'zod';

// Initialize Genkit instance with Google AI plugin
export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
});

// Define Genkit Flow for reseller insights
export const resellerInsightFlow = ai.defineFlow(
  {
    name: 'resellerInsightFlow',
    inputSchema: z.object({
      productName: z.string(),
      marketData: z.array(z.any()).optional(),
    }),
    outputSchema: z.object({
      summary: z.string(),
    }),
  },
  async (input) => {
    const response = await ai.generate({
      model: googleAI.model('gemini-3.6-flash'),
      prompt: `Analyze reseller market trends and resale potential for "${input.productName}". Data: ${JSON.stringify(input.marketData || [])}`,
    });
    return {
      summary: response.text,
    };
  }
);

/**
 * RxJS Stream Wrapper for Genkit Reseller Insight Flow
 * Complies with AGENTS.md RxJS async requirements
 */
export const runResellerInsightFlow$ = (input) => {
  return defer(() => from(resellerInsightFlow(input))).pipe(
    map((result) => ({
      success: true,
      data: result,
    })),
    catchError((error) => of({ success: false, error: error.message }))
  );
};
