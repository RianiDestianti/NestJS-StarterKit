import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ExceptionFilter } from "./middleware/exception.filter";

const REQUIRED_ENV = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET']

async function bootstrap() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key])
  if (missing.length) {
    console.error(`❌ Env wajib belum diisi: ${missing.join(', ')}`);
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin         : process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    methods        : ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders : ['Content-Type', 'Authorization'],
  })

  app.useGlobalFilters(new ExceptionFilter())

  await app.listen(Number(process.env.PORT ?? 3000), process.env.HOST ?? '0.0.0.0');
}

bootstrap();
