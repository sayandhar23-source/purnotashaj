import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NewsletterService } from './newsletter.service';
import { NewsletterController } from './newsletter.controller';
import { NewsletterSubscriber, NewsletterSchema } from '../common/schemas/newsletter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: NewsletterSubscriber.name, schema: NewsletterSchema }]),
  ],
  controllers: [NewsletterController],
  providers: [NewsletterService],
})
export class NewsletterModule {}
