import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { DESTINATIONS, roomTitle } from './destinations';
import {
  readInitialAdminConfig,
  type InitialAdminConfig,
} from './initial-admin';

const prisma = new PrismaClient();

async function ensureInitialAdmin(config: InitialAdminConfig): Promise<void> {
  const existing = await prisma.user.findUnique({
    where: { email: config.email },
    select: { id: true, role: true },
  });
  if (existing !== null) {
    if (existing.role !== UserRole.ADMIN) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: UserRole.ADMIN },
      });
    }
    return;
  }

  await prisma.user.create({
    data: {
      email: config.email,
      nickname: config.nickname,
      passwordHash: await bcrypt.hash(config.password, 12),
      role: UserRole.ADMIN,
    },
  });
}

async function seed(): Promise<void> {
  const initialAdmin = readInitialAdminConfig();
  for (const seed of DESTINATIONS) {
    const { slug, ...fields } = seed;
    const destination = await prisma.destination.upsert({
      where: { slug },
      create: { slug, ...fields },
      update: fields,
    });
    await prisma.destinationRoom.upsert({
      where: { slug },
      create: {
        slug,
        title: roomTitle(seed.nameKo),
        destinationId: destination.id,
      },
      update: { title: roomTitle(seed.nameKo), destinationId: destination.id },
    });
  }

  if (initialAdmin !== undefined) await ensureInitialAdmin(initialAdmin);
}

async function run(): Promise<void> {
  try {
    await seed();
  } finally {
    await prisma.$disconnect();
  }
}

void run();
