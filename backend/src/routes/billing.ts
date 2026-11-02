import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../database';
import { authMiddleware, AuthRequest, requireStaff, requireRole } from '../middleware/auth';

const router = Router();

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const createInvoiceSchema = z.object({
  patientId: z.number().int().positive(),
  examId: z.number().int().positive(),
  amount: z.number().nonnegative(),
  status: z.enum(['unpaid', 'paid', 'cancelled']).optional(),
});

const updateInvoiceSchema = z.object({
  status: z.enum(['unpaid', 'paid', 'cancelled']),
});

// GET /api/invoices/
// Patients see only their own invoices; staff (receptionist, radiologist) see all.
router.get('/', authMiddleware, requireRole('patient', 'receptionist'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const where = user.role === 'patient' ? { patientId: user.id } : {};

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        patient: { select: { id: true, username: true, email: true, firstName: true, lastName: true, role: true } },
        exam: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(invoices);
  } catch (error) {
    next(error);
  }
});

// GET /api/invoices/:id/
router.get('/:id', authMiddleware, requireRole('patient', 'receptionist'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: parsedParams.data.id },
      include: {
        patient: { select: { id: true, username: true, email: true, firstName: true, lastName: true, role: true } },
        exam: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (user.role === 'patient' && invoice.patientId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(invoice);
  } catch (error) {
    next(error);
  }
});

// POST /api/invoices/ (receptionist/radiologist staff only)
router.post('/', authMiddleware, requireRole('receptionist'), requireStaff, async (req: AuthRequest, res: Response, next: NextFunction) => {
  const parsed = createInvoiceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  try {
    const exam = await prisma.exam.findUnique({ where: { id: parsed.data.examId } });
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    if (exam.patientId !== parsed.data.patientId) {
      return res.status(400).json({ error: 'Exam does not belong to patient', code: 'validation_error' });
    }

    const patient = await prisma.user.findUnique({ where: { id: parsed.data.patientId } });
    if (!patient || patient.role !== 'patient') {
      return res.status(400).json({ error: 'Invalid patient', code: 'validation_error' });
    }

    const invoice = await prisma.invoice.create({
      data: {
        patientId: parsed.data.patientId,
        examId: parsed.data.examId,
        amount: parsed.data.amount,
        status: parsed.data.status ?? 'unpaid',
      },
      include: {
        patient: { select: { id: true, username: true, email: true, firstName: true, lastName: true, role: true } },
        exam: true,
      },
    });
    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/invoices/:id/ (receptionist/radiologist staff only) - update invoice status
router.patch('/:id', authMiddleware, requireRole('receptionist'), requireStaff, async (req: AuthRequest, res: Response, next: NextFunction) => {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
  }
  const parsed = updateInvoiceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  try {
    const existing = await prisma.invoice.findUnique({ where: { id: parsedParams.data.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = await prisma.invoice.update({
      where: { id: parsedParams.data.id },
      data: { status: parsed.data.status },
      include: {
        patient: { select: { id: true, username: true, email: true, firstName: true, lastName: true, role: true } },
        exam: true,
      },
    });
    res.json(invoice);
  } catch (error) {
    next(error);
  }
});

export default router;