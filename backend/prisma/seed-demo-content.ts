import { PrismaClient } from '@prisma/client';
import { ensureDemoWaitingTopic } from './demo-content';
import { assertDemoSeedAllowed } from './demo-seed-guard';

const prisma = new PrismaClient();

async function run(): Promise<void> {
  assertDemoSeedAllowed();
  try {
    await ensureDemoWaitingTopic(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

void run();
