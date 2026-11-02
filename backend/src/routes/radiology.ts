import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../database';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

const reportQuerySchema = z.object({
  examId: z.coerce.number().int().positive().optional(),
});

const createReportSchema = z.object({
  examId: z.number().int().positive(),
  content: z.string().min(1),
});

// GET /api/reports/
router.get('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  const parsedQuery = reportQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    return res.status(400).json({ error: 'Invalid query', code: 'validation_error', issues: parsedQuery.error.issues });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const where: Record<string, unknown> = {};
    if (parsedQuery.data.examId) {
      where.examId = parsedQuery.data.examId;
    }
    if (user.role === 'patient') {
      where.exam = { patientId: req.userId };
    }

    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        exam: {
          select: {
            id: true,
            bodyPart: true,
            scheduledDate: true,
            scheduledTime: true,
            status: true,
            patientId: true,
            roomId: true,
          },
        },
        radiologist: {
          select: { id: true, username: true, firstName: true, lastName: true },
        },
      },
    });
    res.json(reports);
  } catch (error) {
    next(error);
  }
});

// POST /api/reports/ (radiologist only) - creates a report, or updates it if one already exists for the exam
router.post('/', authMiddleware, requireRole('radiologist'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  const parsed = createReportSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  if (!req.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const radiologistId = req.userId;
  try {
    const exam = await prisma.exam.findUnique({ where: { id: parsed.data.examId } });
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    const existing = await prisma.report.findFirst({ where: { examId: parsed.data.examId } });

    if (existing) {
      const updated = await prisma.report.update({
        where: { id: existing.id },
        data: {
          content: parsed.data.content,
          radiologistId,
        },
        include: {
          exam: true,
          radiologist: { select: { id: true, username: true, firstName: true, lastName: true } },
        },
      });
      return res.json(updated);
    }

    const report = await prisma.report.create({
      data: {
        examId: parsed.data.examId,
        radiologistId,
        content: parsed.data.content,
      },
      include: {
        exam: true,
        radiologist: { select: { id: true, username: true, firstName: true, lastName: true } },
      },
    });
    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
});

export default router;
