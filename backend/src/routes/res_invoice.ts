import { Router, Request, Response, RequestHandler } from 'express';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logger } from '../lib/logger';
import { levelFor } from '../access';
import type { Level } from '../access';

// Generated resource router for Invoice (no domain route file served it). Every request asks access.ts what the
// caller's role may do with Invoice; nothing is read without a login.
const router = Router();
const MODEL = 'Invoice';
const guard: RequestHandler[] = [authMiddleware as unknown as RequestHandler];
function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}
const createSchema = z.object({
  patientId: z.number().int().optional(),
  examId: z.number().int(),
  amount: z.number(),
  status: z.string(),
  paidAt: z.union([z.null(), z.coerce.date()]).optional(),
  stripeSessionId: z.string().nullable().optional(),
});
const updateSchema = createSchema.partial();
const listQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
function parseBody<S extends z.ZodTypeAny>(schema: S, res: Response, body: unknown): z.output<S> | null {
  const r = schema.safeParse(body);
  if (r.success === false) {
    res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: r.error.issues }); return null;
  }
  return r.data;
}
async function sendList(req: Request, res: Response, where: Prisma.InvoiceWhereInput): Promise<void> {
  const q = listQuery.safeParse(req.query);
  if (q.success === false) {
    res.status(400).json({ error: 'Invalid query', code: 'validation_error', issues: q.error.issues }); return;
  }
  if (q.data.page === undefined) { res.json(await prisma.invoice.findMany({ where, orderBy: { id: 'asc' } })); return; }
  const skip = (q.data.page - 1) * q.data.pageSize;
  const [items, total] = await Promise.all([
    prisma.invoice.findMany({ where, orderBy: { id: 'asc' }, skip, take: q.data.pageSize }),
    prisma.invoice.count({ where }),
  ]);
  res.json({ items, total, page: q.data.page, pageSize: q.data.pageSize });
}
function writeFailed(res: Response, err: unknown): void {
  const code = typeof err === 'object' && err !== null ? (err as { code?: unknown }).code : undefined;
  if (code === 'P2002') { res.status(409).json({ error: 'This Invoice already exists', code: 'conflict' }); return; }
  if (code === 'P2003') {
    res.status(400).json({ error: 'A linked record does not exist', code: 'invalid_reference' }); return;
  }
  if (code === 'P2025') { res.status(404).json({ error: 'Invoice not found', code: 'not_found' }); return; }
  res.status(400).json({ error: 'Could not save the Invoice', code: 'write_failed' });
}
function callerId(req: Request): number | undefined {
  return (req as Request & { userId?: number }).userId;
}
// The role is read from the database on every request; it never comes from the body or the token.
async function levelOf(req: Request): Promise<Level> {
  const id = callerId(req);
  if (id == null) { return 'none'; }
  const me = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  return levelFor(me?.role, MODEL);
}
function readScope(level: Level, req: Request): Prisma.InvoiceWhereInput | null {
  if (level === 'manage' || level === 'read') { return {}; }
  if (level === 'own' || level === 'read_own') {
    const id = callerId(req);
    return id == null ? null : { patientId: id };
  }
  return null;
}
function writeScope(level: Level, _req: Request): Prisma.InvoiceWhereInput | null {
  if (level === 'manage') { return {}; }
  return null;
}
function denied(res: Response): void {
  res.status(403).json({ error: 'Not allowed for your role', code: 'forbidden' });
}

router.get('/', ...guard, async (req: Request, res: Response) => {
  try {
    const where = readScope(await levelOf(req), req);
    if (where === null) { denied(res); return; }
    await sendList(req, res, where);
  } catch (err) { logger.warn({ err }, 'Invoice read failed'); res.status(500).json({ error: 'Server error', code: 'internal_error' }); }
});

router.get('/:id', ...guard, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) { res.status(400).json({ error: 'Invalid id' }); return; }
  try {
    const where = readScope(await levelOf(req), req);
    if (where === null) { denied(res); return; }
    const item = await prisma.invoice.findFirst({ where: { ...where, id } });
    if (item === null) { res.status(404).json({ error: 'Invoice not found' }); return; }
    res.json(item);
  } catch (err) { logger.warn({ err }, 'Invoice read failed'); res.status(500).json({ error: 'Server error', code: 'internal_error' }); }
});

router.post('/', ...guard, async (req: Request, res: Response) => {
  const level = await levelOf(req);
  if ((level === 'manage') === false) { denied(res); return; }
  const parsed = parseBody(createSchema, res, req.body);
  if (parsed === null) { return; }
  try {
    const data = { ...parsed } as Record<string, unknown>;
    res.status(201).json(await prisma.invoice.create({ data: data as Prisma.InvoiceUncheckedCreateInput }));
  } catch (err) { logger.warn({ err }, 'Invoice write failed'); writeFailed(res, err); }
});

const update = async (req: Request, res: Response) => {
  const level = await levelOf(req);
  const where = writeScope(level, req);
  if (where === null) { denied(res); return; }
  const id = parseId(req.params.id);
  if (id === null) { res.status(400).json({ error: 'Invalid id' }); return; }
  const parsed = parseBody(updateSchema, res, req.body);
  if (parsed === null) { return; }
  try {
    if ((await prisma.invoice.findFirst({ where: { ...where, id } })) === null) { res.status(404).json({ error: 'Invoice not found' }); return; }
    const data = { ...parsed } as Record<string, unknown>;
    res.json(await prisma.invoice.update({ where: { id }, data: data as Prisma.InvoiceUncheckedUpdateInput }));
  } catch (err) { logger.warn({ err }, 'Invoice write failed'); writeFailed(res, err); }
};
router.put('/:id', ...guard, update);
router.patch('/:id', ...guard, update);

router.delete('/:id', ...guard, async (req: Request, res: Response) => {
  const where = writeScope(await levelOf(req), req);
  if (where === null) { denied(res); return; }
  const id = parseId(req.params.id);
  if (id === null) { res.status(400).json({ error: 'Invalid id' }); return; }
  try {
    if ((await prisma.invoice.findFirst({ where: { ...where, id } })) === null) { res.status(404).json({ error: 'Invoice not found' }); return; }
    await prisma.invoice.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { logger.warn({ err }, 'Invoice write failed'); writeFailed(res, err); }
});

export default router;
