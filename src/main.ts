import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { configDotenv } from 'dotenv';
import { AgentProvider } from './agent/agent';
configDotenv();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Medera')
    .setDescription('The Medera API')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  app.enableCors();
  // cont agentProvider = new AgentProvider(app)
  // await app.listen(4001);
  const expressApp = app.getHttpAdapter().getInstance();

  const agentProvider = app.get(AgentProvider); // Access AgentProvider
  await agentProvider.initializeAgent(3000, expressApp);
  await app.listen(3000, () => {
    console.log('NestJS and HTTP inbound transport listening on port 3000');
  });
}
bootstrap();
