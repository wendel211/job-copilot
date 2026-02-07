import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Global unhandled error logging
  process.on('unhandledRejection', (reason, promise) => {
    console.error('[UNHANDLED REJECTION]', reason);
  });

  // Habilitar CORS (frontend poderá consumir a API)
  app.enableCors({
    origin: "*",
    methods: "GET,POST,PATCH,PUT,DELETE,OPTIONS",
  });

  // Prefixo opcional (ex: /api/jobs, /api/email)
  // app.setGlobalPrefix("api");

  // SWAGGER ESSENCIAL
  const config = new DocumentBuilder()
    .setTitle("Job Copilot API")
    .setDescription("API do Job Copilot (Swagger Essencial)")
    .setVersion("1.0.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("docs", app, document, {
    customSiteTitle: "Job Copilot API - Swagger",
    swaggerOptions: {
      docExpansion: "none",
      persistAuthorization: true,
    },
  });

  await app.listen(3003);
  console.log("🚀 Job Copilot API rodando em http://localhost:3003");
  console.log("📄 Swagger disponível em http://localhost:3003/docs");
}

bootstrap();
