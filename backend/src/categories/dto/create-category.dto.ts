import { IsBoolean, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Trim } from '../../common/utils/transforms';

export class CreateCategoryDto {
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name: string;

  @Trim()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug may only contain lowercase letters, numbers and hyphens.' })
  @MaxLength(100)
  slug: string;

  // Optional, and empty is fine (clears it). When present it must be a real http(s) link.
  @IsOptional()
  @Trim()
  @ValidateIf((o) => o.image !== undefined && o.image !== null && o.image !== '')
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: 'Image must be a full web link starting with https://' })
  @MaxLength(1000)
  image?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  showOnSalePage?: boolean;

  // Pass a parent category's _id to make this a subcategory
  @IsOptional()
  @IsString()
  parent?: string | null;
}

// A real class, so validation + whitelisting actually run on updates. The old
// controller typed the body as Partial<CreateCategoryDto>, which TypeScript erases
// at runtime — meaning NO validation happened on category updates at all.
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
