import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../common/schemas/order.schema';
import { User, UserDocument } from '../common/schemas/user.schema';

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  private async revenueBetween(start: Date, end: Date) {
    const result = await this.orderModel.aggregate([
      {
        $match: {
          status: { $in: ['paid', 'shipped', 'delivered'] },
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
    ]);
    return result[0] || { revenue: 0, orders: 0 };
  }

  private async dailySeries(start: Date, end: Date) {
    const result = await this.orderModel.aggregate([
      {
        $match: {
          status: { $in: ['paid', 'shipped', 'delivered'] },
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return result.map((r) => ({ date: r._id, revenue: r.revenue, orders: r.orders }));
  }

  // Summary cards: last 7 days, last 30 days, all-time
  async summary() {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const [last7, last30, totalUsers, totalOrders] = await Promise.all([
      this.revenueBetween(sevenDaysAgo, now),
      this.revenueBetween(thirtyDaysAgo, now),
      this.userModel.countDocuments(),
      this.orderModel.countDocuments(),
    ]);

    return { last7Days: last7, last30Days: last30, totalUsers, totalOrders };
  }

  // Custom range with daily breakdown, for charting
  async range(startDate: string, endDate: string) {
    const start = startOfDay(new Date(startDate));
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const [totals, series] = await Promise.all([
      this.revenueBetween(start, end),
      this.dailySeries(start, end),
    ]);

    return { start, end, totals, series };
  }

  // Compare two periods: 'week' | 'month' | 'year' | 'custom'
  async compare(period: 'week' | 'month' | 'year' | 'custom', customA?: { start: string; end: string }, customB?: { start: string; end: string }) {
    const now = new Date();
    let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;

    if (period === 'week') {
      currentEnd = now;
      currentStart = new Date(now);
      currentStart.setDate(now.getDate() - 7);
      previousEnd = new Date(currentStart);
      previousStart = new Date(currentStart);
      previousStart.setDate(previousStart.getDate() - 7);
    } else if (period === 'month') {
      currentEnd = now;
      currentStart = new Date(now);
      currentStart.setMonth(now.getMonth() - 1);
      previousEnd = new Date(currentStart);
      previousStart = new Date(currentStart);
      previousStart.setMonth(previousStart.getMonth() - 1);
    } else if (period === 'year') {
      currentEnd = now;
      currentStart = new Date(now);
      currentStart.setFullYear(now.getFullYear() - 1);
      previousEnd = new Date(currentStart);
      previousStart = new Date(currentStart);
      previousStart.setFullYear(previousStart.getFullYear() - 1);
    } else {
      // custom: compare customA range vs customB range
      currentStart = startOfDay(new Date(customA.start));
      currentEnd = new Date(customA.end);
      currentEnd.setHours(23, 59, 59, 999);
      previousStart = startOfDay(new Date(customB.start));
      previousEnd = new Date(customB.end);
      previousEnd.setHours(23, 59, 59, 999);
    }

    const [current, previous, currentSeries, previousSeries] = await Promise.all([
      this.revenueBetween(currentStart, currentEnd),
      this.revenueBetween(previousStart, previousEnd),
      this.dailySeries(currentStart, currentEnd),
      this.dailySeries(previousStart, previousEnd),
    ]);

    const growth =
      previous.revenue > 0
        ? ((current.revenue - previous.revenue) / previous.revenue) * 100
        : current.revenue > 0
        ? 100
        : 0;

    return {
      current: { start: currentStart, end: currentEnd, ...current, series: currentSeries },
      previous: { start: previousStart, end: previousEnd, ...previous, series: previousSeries },
      growthPercent: Math.round(growth * 100) / 100,
    };
  }
}
