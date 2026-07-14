import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.userId, dto);
  }

  @Get('my')
  findMine(@CurrentUser() user: any) {
    return this.ordersService.findMyOrders(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.findOne(id, user.role === 'admin' ? undefined : user.userId);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.ordersService.findAll(Number(page), Number(limit));
  }

  // Powers the notification badge in the admin dashboard
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('admin/pending-count')
  pendingCount() {
    return this.ordersService.countPendingConfirmation().then((count) => ({ count }));
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }

  // Admin confirms a paid order — this triggers the customer confirmation email
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id/confirm')
  confirmOrder(@Param('id') id: string) {
    return this.ordersService.confirmOrder(id);
  }
}
