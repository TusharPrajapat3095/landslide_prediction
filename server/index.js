import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from './generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const app = express();
const prisma = new PrismaClient({ adapter });

app.use(cors());

const PORT = 3000;

app.get('/api/measures', async (req, res) => {
  const measures = await prisma.mitigationMeasure.findMany();
  res.json(measures);
});

app.get('/api/measures/:type', async (req, res) => {
  const measures = await prisma.mitigationMeasure.findMany({
    where: { type: req.params.type }
  });
  res.json(measures);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});