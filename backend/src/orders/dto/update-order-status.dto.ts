import { IsIn } from 'class-validator';

export const ORDER_STATUSES = [
  'pending',
  'paid',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
  'failed',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// The status endpoint used to take a raw string, so any value at all could be written.
export class UpdateOrderStatusDto {
  @IsIn(ORDER_STATUSES as unknown as string[])
  status: OrderStatus;
}
