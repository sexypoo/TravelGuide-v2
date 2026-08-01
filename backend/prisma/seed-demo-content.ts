import { PrismaClient } from '@prisma/client';
import { ensureDemoWaitingTopic } from './demo-content';

const prisma = new PrismaClient();

async function run(): Promise<void> {
  if (process.env.DEMO_SEED_ENABLED !== 'true') {
    throw new Error('Set DEMO_SEED_ENABLED=true to run the demo content seed');
  }
  try {
    await ensureDemoWaitingTopic(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

void run();
