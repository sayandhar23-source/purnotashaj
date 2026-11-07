import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NewsletterSubscriber, NewsletterDocument } from '../common/schemas/newsletter.schema';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(NewsletterSubscriber.name) private model: Model<NewsletterDocument>,
  ) {}

  async subscribe(email: string) {
    const existing = await this.model.findOne({ email });
    if (existing) {
      if (existing.isSubscribed) throw new ConflictException('Already subscribed.');
      existing.isSubscribed = true;
      await existing.save();
      return { message: 'Resubscribed successfully.' };
    }
    await this.model.create({ email });
    return { message: 'Subscribed successfully.' };
  }

  async unsubscribe(email: string) {
    await this.model.findOneAndUpdate({ email }, { isSubscribed: false });
    return { message: 'Unsubscribed successfully.' };
  }

  // Admin
  findAll(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    return Promise.all([
      this.model.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.model.countDocuments(),
    ]).then(([subscribers, total]) => ({ subscribers, total, page, pages: Math.ceil(total / limit) }));
  }
}
