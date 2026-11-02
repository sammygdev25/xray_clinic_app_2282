import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../database';
import { authMiddleware, AuthRequest, requireRole, requireStaff } from '../middleware/auth';

const router = Router();

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const createRoomSchema = z.object({
  name: z.string().min(1),
  roomNumber: z.string().min(1),
  isActive: z.boolean().optional(),
});

const updateRoomSchema = z.object({
  name: z.string().min(1).optional(),
  roomNumber: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

const createExamSchema = z.object({
  patientId: z.number().int().positive(),
  bodyPart: z.string().min(1),
  roomId: z.number().int().positive(),
  scheduledDate: z.string().min(1),
  scheduledTime: z.string().min(1),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
});

const updateExamSchema = z.object({
  bodyPart: z.string().min(1).optional(),
  roomId: z.number().int().positive().optional(),
  scheduledDate: z.string().min(1).optional(),
  scheduledTime: z.string().min(1).optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
});

const examUserSelect = {
  id: true,
  username: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
} as const;

// GET /api/rooms/
router.get('/rooms', authMiddleware, requireStaff, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { roomNumber: 'asc' },
    });
    res.json(rooms);
  } catch (error) {
    next(error);
  }
});

// POST /api/rooms/ (receptionist only)
router.post(
  '/rooms',
  authMiddleware,
  requireRole('receptionist'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const parsed = createRoomSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
    }
    try {
      const room = await prisma.room.create({
        data: {
          name: parsed.data.name,
          roomNumber: parsed.data.roomNumber,
          isActive: parsed.data.isActive ?? true,
        },
      });
      res.status(201).json(room);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/rooms/:id (receptionist only)
router.put(
  '/rooms/:id',
  authMiddleware,
  requireRole('receptionist'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const parsedParams = idParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
    }
    const parsed = updateRoomSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
    }
    try {
      const existing = await prisma.room.findUnique({ where: { id: parsedParams.data.id } });
      if (!existing) {
        return res.status(404).json({ error: 'Room not found' });
      }
      const room = await prisma.room.update({
        where: { id: parsedParams.data.id },
        data: parsed.data,
      });
      res.json(room);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/rooms/:id (receptionist only)
router.delete(
  '/rooms/:id',
  authMiddleware,
  requireRole('receptionist'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const parsedParams = idParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
    }
    try {
      const existing = await prisma.room.findUnique({ where: { id: parsedParams.data.id } });
      if (!existing) {
        return res.status(404).json({ error: 'Room not found' });
      }
      await prisma.room.delete({ where: { id: parsedParams.data.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/exams/ (authenticated; patients see their own, staff see all)
router.get('/exams', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const requester = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!requester) {
      return res.status(404).json({ error: 'User not found' });
    }

    const statusParam = typeof req.query.status === 'string' ? req.query.status : undefined;
    const statusSchema = z.enum(['scheduled', 'completed', 'cancelled']).optional();
    const parsedStatus = statusSchema.safeParse(statusParam);
    if (!parsedStatus.success) {
      return res.status(400).json({ error: 'Invalid status', code: 'validation_error', issues: parsedStatus.error.issues });
    }

    const where: Record<string, unknown> = {};
    if (requester.role === 'patient') {
      where.patientId = requester.id;
    }
    if (parsedStatus.data) {
      where.status = parsedStatus.data;
    }

    const exams = await prisma.exam.findMany({
      where,
      orderBy: [{ scheduledDate: 'desc' }, { scheduledTime: 'desc' }],
      include: {
        patient: { select: examUserSelect },
        room: true,
      },
    });
    res.json(exams);
  } catch (error) {
    next(error);
  }
});

// GET /api/exams/:id
router.get('/exams/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
  }
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: parsedParams.data.id },
      include: {
        patient: { select: examUserSelect },
        room: true,
      },
    });
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    const requester = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!requester) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (requester.role === 'patient' && exam.patientId !== requester.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(exam);
  } catch (error) {
    next(error);
  }
});

// POST /api/exams/ (receptionist only)
router.post(
  '/exams',
  authMiddleware,
  requireRole('receptionist'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const parsed = createExamSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
    }
    try {
      const patient = await prisma.user.findUnique({ where: { id: parsed.data.patientId } });
      if (!patient || patient.role !== 'patient') {
        return res.status(400).json({ error: 'patientId must reference a patient', code: 'validation_error' });
      }

      const room = await prisma.room.findUnique({ where: { id: parsed.data.roomId } });
      if (!room || !room.isActive) {
        return res.status(400).json({ error: 'roomId must reference an active room', code: 'validation_error' });
      }

      const exam = await prisma.exam.create({
        data: {
          patientId: parsed.data.patientId,
          bodyPart: parsed.data.bodyPart,
          roomId: parsed.data.roomId,
          scheduledDate: new Date(parsed.data.scheduledDate),
          scheduledTime: parsed.data.scheduledTime,
          status: parsed.data.status ?? 'scheduled',
        },
        include: {
          patient: { select: examUserSelect },
          room: true,
        },
      });
      res.status(201).json(exam);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/exams/:id (receptionist only)
router.put(
  '/exams/:id',
  authMiddleware,
  requireRole('receptionist'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const parsedParams = idParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
    }
    const parsed = updateExamSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
    }
    try {
      const existing = await prisma.exam.findUnique({ where: { id: parsedParams.data.id } });
      if (!existing) {
        return res.status(404).json({ error: 'Exam not found' });
      }

      if (parsed.data.roomId !== undefined) {
        const room = await prisma.room.findUnique({ where: { id: parsed.data.roomId } });
        if (!room || !room.isActive) {
          return res.status(400).json({ error: 'roomId must reference an active room', code: 'validation_error' });
        }
      }

      const data: Record<string, unknown> = { ...parsed.data };
      if (parsed.data.scheduledDate) {
        data.scheduledDate = new Date(parsed.data.scheduledDate);
      }

      const exam = await prisma.exam.update({
        where: { id: parsedParams.data.id },
        data,
        include: {
          patient: { select: examUserSelect },
          room: true,
        },
      });
      res.json(exam);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/exams/:id (receptionist only)
router.delete(
  '/exams/:id',
  authMiddleware,
  requireRole('receptionist'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const parsedParams = idParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
    }
    try {
      const existing = await prisma.exam.findUnique({ where: { id: parsedParams.data.id } });
      if (!existing) {
        return res.status(404).json({ error: 'Exam not found' });
      }
      await prisma.exam.delete({ where: { id: parsedParams.data.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
