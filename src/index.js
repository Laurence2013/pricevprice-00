import express from 'express';
import cors from 'cors';
import skusRouter from './routes/skus.router.js';
import pipelineRouter from './routes/pipeline.router.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Healthcheck Route
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    emulatorHost: process.env.FIRESTORE_EMULATOR_HOST || 'Live Production',
    timestamp: new Date().toISOString()
  });
});

// Modular Routers
app.use('/api/skus', skusRouter);
app.use('/api/pipeline', pipelineRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔥 Firestore target: ${process.env.FIRESTORE_EMULATOR_HOST || 'Production'}`);
});

export default app;
