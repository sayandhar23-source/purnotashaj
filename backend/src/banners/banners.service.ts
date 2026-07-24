import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument } from '../common/schemas/banner.schema';

@Injectable()
export class BannersService {
  constructor(@InjectModel(Banner.name) private model: Model<BannerDocument>) {}

  async findActive() {
    const now = new Date();
    return this.model
      .find({
        isActive: true,
        $and: [
          { $or: [{ startsAt: { $exists: false } }, { startsAt: { $lte: now } }] },
          { $or: [{ endsAt: { $exists: false } }, { endsAt: { $gte: now } }] },
        ],
      })
      .sort({ sortOrder: 1 });
  }

  findAllAdmin() {
    return this.model.find().sort({ sortOrder: 1 });
  }

  create(dto: Partial<Banner>) {
    return this.model.create(dto);
  }

  async update(id: string, dto: Partial<Banner>) {
    const banner = await this.model.findByIdAndUpdate(id, dto, { new: true });
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  async remove(id: string) {
    const banner = await this.model.findByIdAndDelete(id);
    if (!banner) throw new NotFoundException('Banner not found');
    return { message: 'Banner deleted' };
  }
}
