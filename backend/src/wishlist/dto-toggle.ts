import { IsMongoId } from 'class-validator';

export class ToggleWishlistDto {
  @IsMongoId()
  productId: string;
}
