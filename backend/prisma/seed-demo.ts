import {
  LocalProofType,
  PrismaClient,
  UserRole,
  VerificationStatus,
  VerificationType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { mkdir, writeFile } from 'node:fs/promises';
import { isAbsolute, resolve, sep } from 'node:path';
import { randomUUID } from 'node:crypto';

const prisma = new PrismaClient();
const DAY_MS = 24 * 60 * 60 * 1000;
const SAFE_OBJECT_KEY = /^verification\/[A-Za-z0-9_-]+\/[0-9a-f-]{36}$/;
const DEMO_PROOF = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

interface DemoIdentity {
  email: string;
  nickname: string;
  role: UserRole;
  verification?: VerificationType;
}

const identities: readonly DemoIdentity[] = [
  {
    email: 'admin@travelguide.local',
    nickname: '데모관리자',
    role: UserRole.ADMIN,
  },
  {
    email: 'demo@travelguide.local',
    nickname: '데모여행자A',
    role: UserRole.USER,
    verification: VerificationType.TRAVELER,
  },
  {
    email: 'traveler2@travelguide.local',
    nickname: '데모여행자B',
    role: UserRole.USER,
    verification: VerificationType.TRAVELER,
  },
  {
    email: 'local1@travelguide.local',
    nickname: '데모현지인A',
    role: UserRole.USER,
    verification: VerificationType.LOCAL,
  },
  {
    email: 'local2@travelguide.local',
    nickname: '데모현지인B',
    role: UserRole.USER,
    verification: VerificationType.LOCAL,
  },
];

function requiredPassword(name: string): string {
  const value = process.env[name];
  if (
    value === undefined ||
    value.length < 10 ||
    value.length > 72 ||
    !/[A-Za-z]/u.test(value) ||
    !/\d/u.test(value)
  ) {
    throw new Error(`${name} must be 10-72 characters with a letter and digit`);
  }
  return value;
}

function storageRoot(): string {
  const configured =
    process.env.LOCAL_STORAGE_DIR?.trim() || '.data/private-uploads';
  return isAbsolute(configured)
    ? resolve(configured)
    : resolve(process.cwd(), configured);
}

async function ensureProof(objectKey: string): Promise<void> {
  if (!SAFE_OBJECT_KEY.test(objectKey)) {
    throw new Error('Demo proof object key is unsafe');
  }
  const root = storageRoot();
  const path = resolve(root, objectKey);
  if (!path.startsWith(`${root}${sep}`)) {
    throw new Error('Demo proof escaped local storage');
  }
  await mkdir(resolve(path, '..'), { recursive: true, mode: 0o700 });
  await writeFile(path, DEMO_PROOF, { mode: 0o600 });
}

async function ensureVerification(
  userId: string,
  reviewerId: string,
  destinationId: string,
  type: VerificationType,
  now: Date,
): Promise<void> {
  const existing = await prisma.verification.findFirst({
    where: { userId, destinationId, type },
    orderBy: { createdAt: 'desc' },
  });
  const objectKey =
    existing !== null && SAFE_OBJECT_KEY.test(existing.proofObjectKey)
      ? existing.proofObjectKey
      : `verification/${userId}/${randomUUID()}`;
  await ensureProof(objectKey);
  const common = {
    status: VerificationStatus.APPROVED,
    proofObjectKey: objectKey,
    proofOriginalName: 'demo-only-proof.png',
    proofMimeType: 'image/png',
    proofSizeBytes: DEMO_PROOF.byteLength,
    reviewedById: reviewerId,
    reviewedAt: now,
    rejectionReason: null,
    submittedNote: '로컬 시연용 합성 인증 데이터입니다.',
  };
  const typeSpecific =
    type === VerificationType.TRAVELER
      ? {
          startsAt: new Date(now.getTime() - DAY_MS),
          endsAt: new Date(now.getTime() + 30 * DAY_MS),
          localProofType: null,
          expiresAt: null,
        }
      : {
          startsAt: null,
          endsAt: null,
          localProofType: LocalProofType.RESIDENCE,
          expiresAt: new Date(now.getTime() + 90 * DAY_MS),
        };

  if (existing === null) {
    await prisma.verification.create({
      data: { userId, destinationId, type, ...common, ...typeSpecific },
    });
    return;
  }
  await prisma.verification.update({
    where: { id: existing.id },
    data: { ...common, ...typeSpecific },
  });
}

async function seedDemo(): Promise<void> {
  if (process.env.DEMO_SEED_ENABLED !== 'true') {
    throw new Error('Set DEMO_SEED_ENABLED=true to run the demo seed');
  }
  const demoPassword = requiredPassword('DEMO_USER_PASSWORD');
  const adminPassword = requiredPassword('DEMO_ADMIN_PASSWORD');
  const [demoHash, adminHash] = await Promise.all([
    bcrypt.hash(demoPassword, 12),
    bcrypt.hash(adminPassword, 12),
  ]);
  const destination = await prisma.destination.findUnique({
    where: { slug: 'jeju' },
    select: { id: true },
  });
  if (destination === null) {
    throw new Error('Run yarn db:seed before yarn db:seed:demo');
  }

  const users = new Map<string, string>();
  for (const identity of identities) {
    const user = await prisma.user.upsert({
      where: { email: identity.email },
      create: {
        email: identity.email,
        nickname: identity.nickname,
        role: identity.role,
        passwordHash: identity.role === UserRole.ADMIN ? adminHash : demoHash,
      },
      update: {
        nickname: identity.nickname,
        role: identity.role,
        passwordHash: identity.role === UserRole.ADMIN ? adminHash : demoHash,
      },
      select: { id: true },
    });
    users.set(identity.email, user.id);
  }

  const reviewerId = users.get('admin@travelguide.local');
  if (reviewerId === undefined)
    throw new Error('Demo administrator is missing');
  const now = new Date();
  for (const identity of identities) {
    if (identity.verification === undefined) continue;
    const userId = users.get(identity.email);
    if (userId === undefined) throw new Error('Demo user is missing');
    await ensureVerification(
      userId,
      reviewerId,
      destination.id,
      identity.verification,
      now,
    );
  }
}

async function run(): Promise<void> {
  try {
    await seedDemo();
  } finally {
    await prisma.$disconnect();
  }
}

void run();
