import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { defer, from, map, catchError, of } from 'rxjs';
import { z } from 'zod';

// Initialize Genkit instance with Google AI plugin
export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
});

// Load prompt templates from prompts/ directory (.prompt files)
export const resellerInsightPrompt = ai.prompt('resellerInsight');
export const querySearchAnalysisPrompt = ai.prompt('querySearchAnalysis');

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
    const promptFn = await resellerInsightPrompt;
    const response = await promptFn({
      productName: input.productName,
      marketData: input.marketData || []
    });
    return {
      summary: response.text,
    };
  }
);

// Define Genkit Flow for Natural Language Reseller Queries
export const querySearchAnalysisFlow = ai.defineFlow(
  {
    name: 'querySearchAnalysisFlow',
    inputSchema: z.object({
      query: z.string(),
      documents: z.array(z.any()).optional(),
    }),
    outputSchema: z.object({
      answer: z.string(),
      verdict: z.string(),
      estimatedPriceRange: z.string(),
      matchedItemsCount: z.number(),
    }),
  },
  async (input) => {
    const promptFn = await querySearchAnalysisPrompt;
    const response = await promptFn({
      query: input.query,
      documents: input.documents || []
    });

    const text = response.text || '';
    
    // Extract verdict keyword from response text
    let verdict = 'FAIR MARKET PRICE';
    if (text.toLowerCase().includes('great deal') || text.toLowerCase().includes('under budget')) {
      verdict = 'GREAT DEAL';
    } else if (text.toLowerCase().includes('overpriced') || text.toLowerCase().includes('above budget')) {
      verdict = 'OVERPRICED';
    } else if (text.toLowerCase().includes('no matches')) {
      verdict = 'NO MATCHES';
    }

    return {
      answer: text,
      verdict,
      estimatedPriceRange: 'Under target threshold',
      matchedItemsCount: (input.documents || []).length,
    };
  }
);

/**
 * RxJS Stream Wrapper for Genkit Reseller Insight Flow
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

/**
 * RxJS Stream Wrapper for Query Search Analysis Flow
 * Complies with AGENTS.md RxJS async requirements
 */
export const runQuerySearchAnalysisFlow$ = (input) => {
  return defer(() => from(querySearchAnalysisFlow(input))).pipe(
    map((result) => ({
      success: true,
      data: result,
    })),
    catchError((error) => of({ success: false, error: error.message }))
  );
};
