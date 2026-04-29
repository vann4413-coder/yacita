import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

function hashPassword(plain: string): string {
  return crypto.createHash('sha256').update(plain).digest('hex');
}

function addHours(date: Date, h: number): Date {
  return new Date(date.getTime() + h * 3_600_000);
}

async function main() {
  console.warn('Seeding database...');

  // ── Paciente de prueba ───────────────────────────────────────────────
  const patient = await prisma.user.upsert({
    where: { email: 'paciente@yacita.es' },
    update: {},
    create: {
      id: 'user_patient_seed',
      email: 'paciente@yacita.es',
      passwordHash: hashPassword('Password1!'),
      name: 'Ana García',
      role: 'PATIENT',
      lat: 40.4168,
      lng: -3.7038,
    },
  });

  // ── Propietario de clínica ───────────────────────────────────────────
  const owner = await prisma.user.upsert({
    where: { email: 'clinica@yacita.es' },
    update: {},
    create: {
      id: 'user_owner_seed',
      email: 'clinica@yacita.es',
      passwordHash: hashPassword('Password1!'),
      name: 'Carlos Ruiz',
      role: 'CLINIC_OWNER',
      lat: 40.418,
      lng: -3.705,
    },
  });

  // ── Clínica 1 (Madrid centro) ────────────────────────────────────────
  const clinic1 = await prisma.clinic.upsert({
    where: { id: 'clinic_seed_01' },
    update: {},
    create: {
      id: 'clinic_seed_01',
      name: 'FisioGram Madrid Centro',
      address: 'Calle Gran Vía 42, Madrid',
      lat: 40.4198,
      lng: -3.7025,
      photos: [],
      services: ['FISIO', 'MASAJE'],
      description: 'Centro de fisioterapia y masajes en el corazón de Madrid.',
      ownerId: owner.id,
      verified: true,
    },
  });

  // ── Clínica 2 (Malasaña) ─────────────────────────────────────────────
  const clinic2 = await prisma.clinic.upsert({
    where: { id: 'clinic_seed_02' },
    update: {},
    create: {
      id: 'clinic_seed_02',
      name: 'OsteoSalud Malasaña',
      address: 'Calle Fuencarral 88, Madrid',
      lat: 40.4268,
      lng: -3.7022,
      photos: [],
      services: ['OSTEO', 'QUIRO'],
      description: 'Especialistas en osteopatía y quiropráctica.',
      ownerId: owner.id,
      verified: true,
    },
  });

  // ── Subscription Pro para clínica 1 ─────────────────────────────────
  await prisma.subscription.upsert({
    where: { clinicId: clinic1.id },
    update: {},
    create: {
      clinicId: clinic1.id,
      stripeCustomerId: 'cus_seed_example_01',
      stripeSubId: 'sub_seed_example_01',
      plan: 'PRO',
      status: 'ACTIVE',
      currentPeriodEnd: addHours(new Date(), 30 * 24),
    },
  });

  // ── Huecos disponibles (próximas 48 h) ──────────────────────────────
  const now = new Date();

  const gapsData = [
    {
      id: 'gap_seed_01',
      clinicId: clinic1.id,
      datetime: addHours(now, 3),
      durationMins: 60,
      service: 'FISIO',
      stdPrice: 50,
      discountPrice: 35,
    },
    {
      id: 'gap_seed_02',
      clinicId: clinic1.id,
      datetime: addHours(now, 8),
      durationMins: 30,
      service: 'MASAJE',
      stdPrice: 40,
      discountPrice: 28,
    },
    {
      id: 'gap_seed_03',
      clinicId: clinic2.id,
      datetime: addHours(now, 5),
      durationMins: 45,
      service: 'OSTEO',
      stdPrice: 60,
      discountPrice: 42,
    },
    {
      id: 'gap_seed_04',
      clinicId: clinic2.id,
      datetime: addHours(now, 26),
      durationMins: 60,
      service: 'QUIRO',
      stdPrice: 55,
      discountPrice: 38,
    },
  ];

  for (const gap of gapsData) {
    await prisma.gap.upsert({
      where: { id: gap.id },
      update: {},
      create: { ...gap, status: 'AVAILABLE', maxBookings: 1 },
    });
  }

  // ── Reserva de prueba ────────────────────────────────────────────────
  await prisma.booking.upsert({
    where: { gapId_userId: { gapId: 'gap_seed_04', userId: patient.id } },
    update: {},
    create: {
      gapId: 'gap_seed_04',
      userId: patient.id,
      status: 'CONFIRMED',
      note: 'Tengo dolor lumbar desde hace una semana',
    },
  });

  console.warn('Seed completado:');
  console.warn(`  - Paciente: ${patient.email}`);
  console.warn(`  - Clínica owner: ${owner.email}`);
  console.warn(`  - Clínicas: ${clinic1.name}, ${clinic2.name}`);
  console.warn(`  - Gaps creados: ${gapsData.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
