import express from 'express';
import cors from 'cors';
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔥 Firestore target: ${process.env.FIRESTORE_EMULATOR_HOST || 'Production'}`);
});
