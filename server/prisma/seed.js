import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import { measures } from './measures-data.js';   // <-- new import, replaces the hardcoded array

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.mitigationMeasure.deleteMany();
  await prisma.mitigationMeasure.createMany({ data: measures });
  console.log(`Seeded ${measures.length} measures.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());