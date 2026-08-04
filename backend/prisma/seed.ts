import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
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
  const destination = await prisma.destination.upsert({
    where: { slug: 'jeju' },
    create: {
      slug: 'jeju',
      nameKo: '제주',
      countryCode: 'KR',
      timezone: 'Asia/Seoul',
      centerLatitude: '33.3617',
      centerLongitude: '126.5292',
      radiusKm: '80',
    },
    update: {
      nameKo: '제주',
      countryCode: 'KR',
      timezone: 'Asia/Seoul',
      centerLatitude: '33.3617',
      centerLongitude: '126.5292',
      radiusKm: '80',
    },
  });

  await prisma.destinationRoom.upsert({
    where: { slug: 'jeju' },
    create: {
      slug: 'jeju',
      title: '제주 실시간 여행 도움방',
      destinationId: destination.id,
    },
    update: {
      title: '제주 실시간 여행 도움방',
      destinationId: destination.id,
    },
  });

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
