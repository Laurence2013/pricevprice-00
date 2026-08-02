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
app.post('/api/skus', (req, res) => {
  const { title, price } = req.body;
  const skuData = { title, price, createdAt: new Date().toISOString() };

  defer(() => from(db.collection('skus').add(skuData))).pipe(
		tap((docRef) => console.log(`Saving document ${docRef.id} to Emulator`)),
		map((docRef) => ({
			status: 201,
			body: {
				success: true,
				id: docRef.id,
				message: `Document ${docRef.id} created.`
			}})),
		catchError((error) => of({
			status: 500,
			body: { success: false, error: error.message }
		}))).subscribe(({ status, body }) => res.status(status).json(body));
});
app.get('/api/skus/:id', (req, res) => {
  const { id } = req.params;

  defer(() => from(db.collection('skus').doc(id).get())).pipe(
		map((doc) => {
			if (!doc.exists) {
				return {status: 404, body: { success: false, message: 'Document not found' }};
			}
			return {status: 200, body: { success: true, data: { id: doc.id, ...doc.data() }}};
		}),
		catchError((error) => of({status: 500, body: { success: false, error: error.message }}))
  ).subscribe(({ status, body }) => res.status(status).json(body));
});
// UPDATE (PATCH /api/skus/:id - RxJS)
app.patch('/api/skus/:id', (req, res) => {
  const { id } = req.params;
  const updateData = {...req.body, updatedAt: new Date().toISOString()};

  defer(() => from(db.collection('skus').doc(id).update(updateData))).pipe(
		map(() => ({status: 200, body: { success: true, message: `Document ${id} updated.` }})),
		catchError((error) => of({status: 500,body: { success: false, error: error.message }}))
	).subscribe(({ status, body }) => res.status(status).json(body));
});
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔥 Firestore target: ${process.env.FIRESTORE_EMULATOR_HOST || 'Production'}`);
});
