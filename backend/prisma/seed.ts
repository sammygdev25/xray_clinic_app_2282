import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // A seeded database is never seeded twice (the image runs this on every boot with SEED_DEMO=1).
  if ((await prisma.user.count()) > 0 && process.env.SEED_FORCE !== '1') {
    console.log('Seed skipped: the database already has users (SEED_FORCE=1 seeds anyway).');
    return;
  }

  // Create demo user
  // The demo password is this project's own (SEED_DEMO_PASSWORD in backend/.env, made at generation, never shipped):
  // no generated app shares a known password. Without it there are no demo accounts and no demo data.
  const demoPassword = process.env.SEED_DEMO_PASSWORD || '';
  if (!demoPassword) {
    console.warn('[seed] SEED_DEMO_PASSWORD is not set: no demo accounts and no demo data.');
    return;
  }
  const hashedPassword = await bcrypt.hash(demoPassword, 10);
  await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      username: 'demo',
      email: 'demo@example.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
    },
  });

  // The receptionist account, with its own password (SEED_RECEPTIONIST_PASSWORD in backend/.env); without it there is none.
  const receptionistPassword = process.env.SEED_RECEPTIONIST_PASSWORD || '';
  if (receptionistPassword) {
    await prisma.user.upsert({
      where: { email: 'receptionist@example.com' },
      update: {},
      create: {
        username: 'receptionist',
        email: 'receptionist@example.com',
        password: await bcrypt.hash(receptionistPassword, 10),
        firstName: 'Demo',
        lastName: 'Receptionist',
        role: 'receptionist',
      },
    });
  }

  // The radiologist account, with its own password (SEED_RADIOLOGIST_PASSWORD in backend/.env); without it there is none.
  const radiologistPassword = process.env.SEED_RADIOLOGIST_PASSWORD || '';
  if (radiologistPassword) {
    await prisma.user.upsert({
      where: { email: 'radiologist@example.com' },
      update: {},
      create: {
        username: 'radiologist',
        email: 'radiologist@example.com',
        password: await bcrypt.hash(radiologistPassword, 10),
        firstName: 'Demo',
        lastName: 'Radiologist',
        role: 'radiologist',
      },
    });
  }

  // Domain seed data
  const ids: Record<string, number[]> = {};
  const pick = (list: number[] | undefined, n: number): number => (list && list.length ? list[(n - 1) % list.length] : n);
  ids.User = (await prisma.user.findMany({ select: { id: true }, orderBy: { id: 'asc' } })).map((r) => r.id);
  try {
    await prisma.room.create({ data: { name: 'Radiography Suite A', roomNumber: '101', isActive: true } });
    await prisma.room.create({ data: { name: 'Radiography Suite B', roomNumber: '102', isActive: true } });
    await prisma.room.create({ data: { name: 'CT Scan Room', roomNumber: '103', isActive: true } });
    await prisma.room.create({ data: { name: 'MRI Chamber', roomNumber: '104', isActive: true } });
    ids.Room = (await prisma.room.findMany({ select: { id: true }, orderBy: { id: 'asc' } })).map((r) => r.id);
  } catch (e) { console.warn('[seed] Room skipped:', e); }
  try {
    await prisma.exam.create({ data: { patientId: pick(ids.User, 1), bodyPart: 'Chest', roomId: pick(ids.Room, 1), scheduledDate: new Date(), scheduledTime: '18:00', status: 'scheduled' } });
    await prisma.exam.create({ data: { patientId: pick(ids.User, 2), bodyPart: 'Left Wrist', roomId: pick(ids.Room, 2), scheduledDate: new Date(), scheduledTime: '19:00', status: 'completed' } });
    await prisma.exam.create({ data: { patientId: pick(ids.User, 3), bodyPart: 'Abdomen', roomId: pick(ids.Room, 3), scheduledDate: new Date(), scheduledTime: '20:00', status: 'cancelled' } });
    await prisma.exam.create({ data: { patientId: pick(ids.User, 4), bodyPart: 'Lumbar Spine', roomId: pick(ids.Room, 4), scheduledDate: new Date(), scheduledTime: '21:00', status: 'scheduled' } });
    await prisma.exam.create({ data: { patientId: pick(ids.User, 5), bodyPart: 'Right Knee', roomId: pick(ids.Room, 5), scheduledDate: new Date(), scheduledTime: '17:00', status: 'completed' } });
    await prisma.exam.create({ data: { patientId: pick(ids.User, 6), bodyPart: 'Skull', roomId: pick(ids.Room, 6), scheduledDate: new Date(), scheduledTime: '18:00', status: 'cancelled' } });
    await prisma.exam.create({ data: { patientId: pick(ids.User, 7), bodyPart: 'Pelvis', roomId: pick(ids.Room, 7), scheduledDate: new Date(), scheduledTime: '19:00', status: 'scheduled' } });
    await prisma.exam.create({ data: { patientId: pick(ids.User, 8), bodyPart: 'Right Shoulder', roomId: pick(ids.Room, 8), scheduledDate: new Date(), scheduledTime: '20:00', status: 'completed' } });
    await prisma.exam.create({ data: { patientId: pick(ids.User, 9), bodyPart: 'Cervical Spine', roomId: pick(ids.Room, 9), scheduledDate: new Date(), scheduledTime: '21:00', status: 'cancelled' } });
    await prisma.exam.create({ data: { patientId: pick(ids.User, 10), bodyPart: 'Right Ankle', roomId: pick(ids.Room, 10), scheduledDate: new Date(), scheduledTime: '17:00', status: 'scheduled' } });
    ids.Exam = (await prisma.exam.findMany({ select: { id: true }, orderBy: { id: 'asc' } })).map((r) => r.id);
  } catch (e) { console.warn('[seed] Exam skipped:', e); }
  try {
    await prisma.report.create({ data: { examId: pick(ids.Exam, 1), radiologistId: pick(ids.User, 1), content: 'No acute cardiopulmonary abnormality detected. Lung fields clear bilaterally.' } });
    await prisma.report.create({ data: { examId: pick(ids.Exam, 2), radiologistId: pick(ids.User, 2), content: 'Mild degenerative changes noted. No fracture or dislocation identified in wrist.' } });
    await prisma.report.create({ data: { examId: pick(ids.Exam, 3), radiologistId: pick(ids.User, 3), content: 'Bowel gas pattern unremarkable. No evidence of obstruction or free air.' } });
    await prisma.report.create({ data: { examId: pick(ids.Exam, 4), radiologistId: pick(ids.User, 4), content: 'Moderate disc space narrowing at L4-L5 with mild spondylosis.' } });
    await prisma.report.create({ data: { examId: pick(ids.Exam, 5), radiologistId: pick(ids.User, 5), content: 'Joint effusion present. No acute fracture of the knee identified.' } });
    await prisma.report.create({ data: { examId: pick(ids.Exam, 6), radiologistId: pick(ids.User, 6), content: 'Skull contours intact. No fracture or lytic lesion observed.' } });
    await prisma.report.create({ data: { examId: pick(ids.Exam, 7), radiologistId: pick(ids.User, 7), content: 'Pelvic ring intact without fracture. Hip joints appear symmetric.' } });
    await prisma.report.create({ data: { examId: pick(ids.Exam, 8), radiologistId: pick(ids.User, 8), content: 'Mild acromioclavicular joint arthrosis. Rotator cuff calcification noted.' } });
    await prisma.report.create({ data: { examId: pick(ids.Exam, 9), radiologistId: pick(ids.User, 9), content: 'Straightening of cervical lordosis, likely due to muscle spasm.' } });
    await prisma.report.create({ data: { examId: pick(ids.Exam, 10), radiologistId: pick(ids.User, 10), content: 'Soft tissue swelling around lateral malleolus. No fracture identified.' } });
    ids.Report = (await prisma.report.findMany({ select: { id: true }, orderBy: { id: 'asc' } })).map((r) => r.id);
  } catch (e) { console.warn('[seed] Report skipped:', e); }
  try {
    await prisma.invoice.create({ data: { patientId: pick(ids.User, 1), examId: pick(ids.Exam, 1), amount: 24.50, status: 'unpaid', paidAt: null } });
    await prisma.invoice.create({ data: { patientId: pick(ids.User, 2), examId: pick(ids.Exam, 2), amount: 38.00, status: 'paid', paidAt: new Date() } });
    await prisma.invoice.create({ data: { patientId: pick(ids.User, 3), examId: pick(ids.Exam, 3), amount: 17.25, status: 'cancelled', paidAt: null } });
    await prisma.invoice.create({ data: { patientId: pick(ids.User, 4), examId: pick(ids.Exam, 4), amount: 52.75, status: 'unpaid', paidAt: null } });
    await prisma.invoice.create({ data: { patientId: pick(ids.User, 5), examId: pick(ids.Exam, 5), amount: 29.00, status: 'paid', paidAt: new Date() } });
    await prisma.invoice.create({ data: { patientId: pick(ids.User, 6), examId: pick(ids.Exam, 6), amount: 44.50, status: 'cancelled', paidAt: null } });
    await prisma.invoice.create({ data: { patientId: pick(ids.User, 7), examId: pick(ids.Exam, 7), amount: 21.75, status: 'unpaid', paidAt: null } });
    await prisma.invoice.create({ data: { patientId: pick(ids.User, 8), examId: pick(ids.Exam, 8), amount: 33.00, status: 'paid', paidAt: new Date() } });
    await prisma.invoice.create({ data: { patientId: pick(ids.User, 9), examId: pick(ids.Exam, 9), amount: 61.25, status: 'cancelled', paidAt: null } });
    await prisma.invoice.create({ data: { patientId: pick(ids.User, 10), examId: pick(ids.Exam, 10), amount: 26.50, status: 'unpaid', paidAt: null } });
    ids.Invoice = (await prisma.invoice.findMany({ select: { id: true }, orderBy: { id: 'asc' } })).map((r) => r.id);
  } catch (e) { console.warn('[seed] Invoice skipped:', e); }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
