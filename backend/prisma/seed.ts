import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed(): Promise<void> {
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
}

async function run(): Promise<void> {
  try {
    await seed();
  } finally {
    await prisma.$disconnect();
  }
}

void run();
