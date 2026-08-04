import { Router } from 'express';
import { map, catchError, of } from 'rxjs';
import { runResellerInsightFlow$ } from '../services/genkit.service.js';

const router = Router();

// POST /api/genkit/reseller-insight
router.post('/reseller-insight', (req, res) => {
  const { productName, marketData } = req.body;
  
  if (!productName) {
    return res.status(400).json({
      success: false,
      error: 'productName is required',
    });
  }

  runResellerInsightFlow$({ productName, marketData }).pipe(
    map((result) => ({
      status: result.success ? 200 : 500,
      body: result,
    })),
    catchError((error) => of({ status: 500, body: { success: false, error: error.message } }))
  ).subscribe(({ status, body }) => res.status(status).json(body));
});

export default router;
