import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegistrationLog, RegistrationLogDocument } from '../common/schemas/registration-log.schema';

@Injectable()
export class AdminLogsService {
  constructor(
    @InjectModel(RegistrationLog.name) private model: Model<RegistrationLogDocument>,
  ) {}

  findAll(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    return Promise.all([
      this.model.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email isVerified'),
      this.model.countDocuments(),
    ]).then(([logs, total]) => ({ logs, total, page, pages: Math.ceil(total / limit) }));
  }
}
