import { QueryRouter } from './query-router';

describe('QueryRouter SQL safety', () => {
  const createRouter = () =>
    new QueryRouter(
      {} as any,
      {} as any,
    );

  it('builds safe SELECT with placeholders', () => {
    const router = createRouter();
    const sql = (router as any).buildSqlQuery(
      {
        orgId: '01-0001-00000001',
        table: 'clients',
        operation: 'SELECT',
        conditions: { status: 'active' },
        orderBy: 'created_at DESC',
        limit: 10,
      },
      'org_01000100000001',
    );

    expect(sql).toContain('SELECT * FROM org_01000100000001.clients');
    expect(sql).toContain('WHERE status = $1');
    expect(sql).toContain('ORDER BY created_at DESC');
    expect(sql).toContain('LIMIT 10');
  });

  it('rejects unsafe table names', () => {
    const router = createRouter();
    expect(() =>
      (router as any).buildSqlQuery(
        {
          orgId: '01-0001-00000001',
          table: 'clients;DROP TABLE clients',
          operation: 'SELECT',
        },
        'org_01000100000001',
      ),
    ).toThrow();
  });

  it('rejects unsafe order by clauses', () => {
    const router = createRouter();
    expect(() =>
      (router as any).buildSqlQuery(
        {
          orgId: '01-0001-00000001',
          table: 'clients',
          operation: 'SELECT',
          orderBy: 'created_at; DROP TABLE clients',
        },
        'org_01000100000001',
      ),
    ).toThrow();
  });

  it('rejects join condition with unknown columns', () => {
    const router = createRouter();
    expect(() =>
      (router as any).buildSqlQuery(
        {
          orgId: '01-0001-00000001',
          table: 'clients',
          operation: 'SELECT',
          joins: [{ table: 'payments', on: 'clients.bad = payments.client_id' }],
        },
        'org_01000100000001',
      ),
    ).toThrow();
  });
});
