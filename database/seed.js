require("dotenv/config");
const knex = require("knex");
const { hash } = require("bcryptjs");

const ADMIN_NAME     = process.env.ADMIN_NAME ?? 'Administrator'
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

async function seed() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('❌ ADMIN_EMAIL dan ADMIN_PASSWORD wajib diisi di .env');
    process.exit(1);
  }

  const db = knex({
    client: process.env.DB_CLIENT ?? "mysql2",
    connection: {
      host     : process.env.DB_HOST,
      port     : process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      user     : process.env.DB_USER,
      password : process.env.DB_PASSWORD,
      database : process.env.DB_NAME,
    },
  });

  try {
    const exists = await db('users').where('email', ADMIN_EMAIL).first()

    if (exists) {
      console.log(`ℹ️ Admin ${ADMIN_EMAIL} sudah ada, seed dilewati`);
      return
    }

    await db('users').insert({
      role_id     : 1,
      name        : ADMIN_NAME,
      email       : ADMIN_EMAIL,
      password    : await hash(ADMIN_PASSWORD, 10),
      verified_at : new Date(),
      created_at  : new Date(),
      updated_at  : new Date(),
    })

    console.log(`✅ Admin ${ADMIN_EMAIL} berhasil dibuat`);
  } finally {
    await db.destroy();
  }
}

seed().catch((error) => {
  console.error('❌ Gagal seed:', error.message);
  process.exit(1);
});
