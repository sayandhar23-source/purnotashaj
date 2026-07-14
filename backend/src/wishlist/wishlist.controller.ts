import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  get(@CurrentUser() user: any) {
    return this.wishlistService.getWishlist(user.userId);
  }

  @Post('toggle')
  toggle(@CurrentUser() user: any, @Body('productId') productId: string) {
    return this.wishlistService.toggle(user.userId, productId);
  }
}
