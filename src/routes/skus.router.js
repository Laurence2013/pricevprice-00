import { Router } from 'express';
import { defer, from, map, catchError, of, tap } from 'rxjs';
import { db } from '../config/firebase.js';
import { skuSchema, skuUpdateSchema } from '../utils/schemas.js';

const router = Router();

// GET /api/skus - List all SKUs
router.get('/', (req, res) => {
  defer(() => from(db.collection('skus').get())).pipe(
    map((snapshot) => {
      const skus = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      return { status: 200, body: { success: true, count: skus.length, data: skus } };
    }),
    catchError((error) => of({ status: 500, body: { success: false, error: error.message } }))
  ).subscribe(({ status, body }) => res.status(status).json(body));
});

// GET /api/skus/:id - Get SKU by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  defer(() => from(db.collection('skus').doc(id).get())).pipe(
    map((doc) => {
      if (!doc.exists) {
        return { status: 404, body: { success: false, message: 'Document not found' } };
      }
      return { status: 200, body: { success: true, data: { id: doc.id, ...doc.data() } } };
    }),
    catchError((error) => of({ status: 500, body: { success: false, error: error.message } }))
  ).subscribe(({ status, body }) => res.status(status).json(body));
});

// POST /api/skus - Create new SKU
router.post('/', (req, res) => {
  const validation = skuSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      errors: validation.error.flatten().fieldErrors
    });
  }

  const skuData = {
    ...validation.data,
    createdAt: new Date().toISOString()
  };

  defer(() => from(db.collection('skus').add(skuData))).pipe(
    tap((docRef) => console.log(`Saving document ${docRef.id} to Firestore`)),
    map((docRef) => ({
      status: 201,
      body: { success: true, id: docRef.id, message: `Document ${docRef.id} created.` }
    })),
    catchError((error) => of({ status: 500, body: { success: false, error: error.message } }))
  ).subscribe(({ status, body }) => res.status(status).json(body));
});

// PATCH /api/skus/:id - Update SKU
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const validation = skuUpdateSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      errors: validation.error.flatten().fieldErrors
    });
  }

  const updateData = {
    ...validation.data,
    updatedAt: new Date().toISOString()
  };

  defer(() => from(db.collection('skus').doc(id).update(updateData))).pipe(
    map(() => ({ status: 200, body: { success: true, message: `Document ${id} updated.` } })),
    catchError((error) => of({ status: 500, body: { success: false, error: error.message } }))
  ).subscribe(({ status, body }) => res.status(status).json(body));
});

// DELETE /api/skus/:id - Delete SKU
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  defer(() => from(db.collection('skus').doc(id).delete())).pipe(
    map(() => ({ status: 200, body: { success: true, message: `Document ${id} deleted.` } })),
    catchError((error) => of({ status: 500, body: { success: false, error: error.message } }))
  ).subscribe(({ status, body }) => res.status(status).json(body));
});

export default router;
