import { Router } from 'express';
import { switchMap, map, catchError, of } from 'rxjs';
import { runApifyActor$, getApifyDatasetItems$, PLATFORM_ACTORS } from '../services/apify.service.js';
import { extractProductData$, summarizeMarketTrends$ } from '../services/gemini.service.js';
import { db } from '../config/firebase.js';
import { scrapeRequestSchema, geminiExtractionSchema, pipelineRequestSchema } from '../utils/schemas.js';

const router = Router();

// POST /api/pipeline/scrape - Universal Apify Web Scraper Endpoint
router.post('/scrape', (req, res) => {
  const validation = scrapeRequestSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      errors: validation.error.flatten().fieldErrors
    });
  }

  const platform = validation.data.platform || 'ebayScraper';
  const actorId = validation.data.actorId || PLATFORM_ACTORS[platform] || PLATFORM_ACTORS.default;
  const input = validation.data.runInput || (validation.data.url ? { startUrls: [{ url: validation.data.url }] } : {});

  runApifyActor$(actorId, input).pipe(
    switchMap((runResult) => {
      if (!runResult.success) {
        return of({ status: 500, body: runResult });
      }
      return getApifyDatasetItems$(runResult.defaultDatasetId).pipe(
        map((itemsResult) => ({
          status: 200,
          body: {
            success: true,
            platform,
            actorId,
            runId: runResult.runId,
            items: itemsResult.items,
            total: itemsResult.total
          }
        }))
      );
    }),
    catchError((error) => of({ status: 500, body: { success: false, error: error.message } }))
  ).subscribe(({ status, body }) => res.status(status).json(body));
});

// POST /api/pipeline/analyze - Trigger Gemini AI content extraction & analysis
router.post('/analyze', (req, res) => {
  const validation = geminiExtractionSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      errors: validation.error.flatten().fieldErrors
    });
  }

  const { prompt, textContent } = validation.data;

  extractProductData$(prompt, textContent).pipe(
    map((aiResult) => {
      if (!aiResult.success) {
        return { status: 500, body: aiResult };
      }
      return { status: 200, body: aiResult };
    }),
    catchError((error) => of({ status: 500, body: { success: false, error: error.message } }))
  ).subscribe(({ status, body }) => res.status(status).json(body));
});

// POST /api/pipeline/run - Full orchestration pipeline
router.post('/run', (req, res) => {
  const validation = pipelineRequestSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      errors: validation.error.flatten().fieldErrors
    });
  }

  const { url, query, saveToDb } = validation.data;
  const prompt = `Analyze market listing data for query '${query || url}' and return structured SKU summary details with title, estimated price, and market summary.`;

  const scrapeInput = url ? { startUrls: [{ url }] } : {};

  runApifyActor$('apify/web-scraper', scrapeInput).pipe(
    switchMap((scrapeRun) => {
      if (!scrapeRun.success) {
        return extractProductData$(prompt, `Query requested: ${query || url}`);
      }
      return getApifyDatasetItems$(scrapeRun.defaultDatasetId).pipe(
        switchMap((dataset) => {
          const context = JSON.stringify(dataset.items || []);
          return summarizeMarketTrends$(dataset.items || []);
        })
      );
    }),
    switchMap((analysis) => {
      if (saveToDb && analysis.success) {
        const record = {
          query: query || url,
          analysisText: analysis.text,
          createdAt: new Date().toISOString()
        };
        return db.collection('pipeline_runs').add(record).then((ref) => ({
          ...analysis,
          savedDocumentId: ref.id
        }));
      }
      return Promise.resolve(analysis);
    }),
    map((result) => ({
      status: 200,
      body: {
        success: true,
        data: result
      }
    })),
    catchError((error) => of({ status: 500, body: { success: false, error: error.message } }))
  ).subscribe(({ status, body }) => res.status(status).json(body));
});

export default router;
