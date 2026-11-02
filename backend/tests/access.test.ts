import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '../src/index';
import { createTestUser, prisma, resetDatabase, tokenFor } from './setup';
import { ROLES, levelFor } from '../src/access';

// Generated with the access-driven resource routers: every role reads and writes each model only as access.ts allows,
// and nothing private is read without a login.
const cases = [{ mount: '/api/invoices', model: 'Invoice', owned: true, open: false, priced: true }, { mount: '/api/reports', model: 'Report', owned: true, open: false, priced: false }];

describe('access-driven resource routers', () => {
  const tokens: Record<string, string> = {};
  beforeEach(async () => {
    await resetDatabase();
    for (const role of ROLES) {
      const { user } = await createTestUser({ username: 'as_' + role, email: role + '@access.example.com' });
      await prisma.user.update({ where: { id: user.id }, data: { role } });
      tokens[role] = `Bearer ${tokenFor(user.id)}`;
    }
  });
  it.each(cases)('$mount follows access.ts', async ({ mount, model, owned, open, priced }) => {
    expect(open ? [200] : [401, 403]).toContain((await request(app).get(mount + '/')).status);
    for (const role of ROLES) {
      const level = levelFor(role, model);
      const reads = level === 'manage' || level === 'read' || (owned && (level === 'own' || level === 'read_own'));
      const list = await request(app).get(mount + '/?page=1&pageSize=5').set('Authorization', tokens[role]);
      expect([role, list.status]).toEqual([role, open || reads ? 200 : 403]);
      const writes = level === 'manage' || (priced === false && (level === 'create' || (owned && level === 'own')));
      const made = await request(app).post(mount + '/').set('Authorization', tokens[role]).send([]);
      expect([role, made.status]).toEqual([role, writes ? 400 : 403]);
    }
  });
});
