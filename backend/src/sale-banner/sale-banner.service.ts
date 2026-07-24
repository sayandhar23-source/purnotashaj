import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SaleBannerContent,
  SaleBannerContentDocument,
} from '../common/schemas/sale-banner-content.schema';
import { UpdateSaleBannerContentDto } from './dto/update-sale-banner-content.dto';

@Injectable()
export class SaleBannerService {
  constructor(
    @InjectModel(SaleBannerContent.name)
    private model: Model<SaleBannerContentDocument>,
  ) {}

  async getContent() {
    let content = await this.model.findOne();
    if (!content) {
      content = await this.model.create({});
    }
    return content;
  }

  async updateContent(dto: UpdateSaleBannerContentDto) {
    let content = await this.model.findOne();
    if (!content) {
      content = await this.model.create(dto);
    } else {
      Object.assign(content, dto);
      await content.save();
    }
    return content;
  }
}
