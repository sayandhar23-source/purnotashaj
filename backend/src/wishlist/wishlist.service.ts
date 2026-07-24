import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wishlist, WishlistDocument } from '../common/schemas/wishlist.schema';

@Injectable()
export class WishlistService {
  constructor(@InjectModel(Wishlist.name) private wishlistModel: Model<WishlistDocument>) {}

  async getWishlist(userId: string) {
    let wishlist = await this.wishlistModel
      .findOne({ user: userId })
      .populate('products');
    if (!wishlist) {
      wishlist = await this.wishlistModel.create({ user: userId, products: [] });
    }
    return wishlist;
  }

  async toggle(userId: string, productId: string) {
    let wishlist = await this.wishlistModel.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await this.wishlistModel.create({ user: userId, products: [productId] });
      return wishlist;
    }
    const exists = wishlist.products.some((p) => p.toString() === productId);
    if (exists) {
      wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
    } else {
      wishlist.products.push(new Types.ObjectId(productId));
    }
    await wishlist.save();
    return wishlist.populate('products');
  }
}
