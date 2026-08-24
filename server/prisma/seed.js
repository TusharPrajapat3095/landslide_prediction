import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const measures = [
  {
    name: "Retaining Wall",
    type: "structural",
    description: "A structure built to hold back soil on a slope.",
    landslideType: "deep",
    costLevel: "high",
    effectiveness: 8,
    installationTime: "months"
  },
  {
    name: "Vegetation Cover",
    type: "nature-based",
    description: "Plants and root systems that stabilize soil naturally.",
    landslideType: "shallow",
    costLevel: "low",
    effectiveness: 5,
    installationTime: "months"
  },
  {
    name: "Drainage System",
    type: "structural",
    description: "Channels excess water away from unstable slopes.",
    landslideType: "shallow",
    costLevel: "medium",
    effectiveness: 7,
    installationTime: "weeks"
  },
  {
    name: "Soil Nailing",
    type: "structural",
    description: "Steel bars driven into a slope to reinforce it internally.",
    landslideType: "deep",
    costLevel: "high",
    effectiveness: 9,
    installationTime: "months"
  },
  {
    name: "Slope Regrading",
    type: "structural",
    description: "Reshaping the slope angle to reduce gravitational stress.",
    landslideType: "shallow",
    costLevel: "medium",
    effectiveness: 6,
    installationTime: "weeks"
  },
  {
    name: "Rockfall Netting",
    type: "structural",
    description: "Mesh netting installed to catch falling rock debris.",
    landslideType: "rockfall",
    costLevel: "medium",
    effectiveness: 7,
    installationTime: "weeks"
  },
  {
    name: "Bioengineering (Root Reinforcement)",
    type: "nature-based",
    description: "Deep-rooted plants used to mechanically bind soil layers.",
    landslideType: "shallow",
    costLevel: "low",
    effectiveness: 6,
    installationTime: "months"
  }
];

async function main() {
  await prisma.mitigationMeasure.deleteMany(); // clears old test rows first
  await prisma.mitigationMeasure.createMany({ data: measures });
  console.log(`Seeded ${measures.length} measures.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());