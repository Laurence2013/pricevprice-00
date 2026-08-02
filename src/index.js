import express from 'express';
import cors from 'cors';
import { tap, from, defer, of, map, catchError } from 'rxjs';
import { db } from './config/firebase.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Healthcheck Route
app.get('/health', async (req, res) => {
  res.json({
    status: 'ok',
    emulatorHost: process.env.FIRESTORE_EMULATOR_HOST || 'Live Production',
  });
});

// Create SKU Route (RxJS)
app.post('/api/skus', (req, res) => {
  const { id, title, price } = req.body;
  const skuData = {title, price, createdAt: new Date().toISOString()};

  defer(() => from(db.collection('skus').doc(id).set(skuData)))
    .pipe(
			tap(_ => console.log('Saving to the Emulator')),
      map(() => ({
        status: 201,
        body: { success: true, message: `Document ${id} created.` }
      })),
      catchError((error) => of({
        status: 500,
        body: { success: false, error: error.message }
      }))
    ).subscribe(({ status, body }) => res.status(status).json(body));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔥 Firestore target: ${process.env.FIRESTORE_EMULATOR_HOST || 'Production'}`);
});
