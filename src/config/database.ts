import knex from "knex";
import _bookshelf from 'bookshelf';
import paranoia from 'bookshelf-paranoia';

const db = knex({
  client: process.env.DB_CLIENT ?? "mysql2",
  connection: {
    host: process.env.DB_HOST ?? "",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  } as any,
  pool: {

    min: 0,
    max: 10,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    acquireTimeoutMillis: 30000,

    afterCreate: (conn: any, done: (err: Error | null, conn: any) => void) => {
      const markClosed = (reason: string) => () => {
        if (!conn._fatalError) conn._fatalError = new Error(`MySQL connection ${reason}`);
      };
      conn.on("end", markClosed("ended"));
      conn.on("error", markClosed("errored"));
      conn.stream?.on?.("close", markClosed("closed"));
      done(null, conn);
    },
  },
});

const bookshelf = _bookshelf(db);
bookshelf.plugin(paranoia, { field: 'deleted_at' });

export { db, bookshelf };
