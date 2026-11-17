import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { ContactMessage } from '../models/ContactMessage';
import { ORDER_STATUS, PAYMENT_STATUS, USER_ROLES } from '../constants';
import { roundPrice } from '../utils/helpers';
import { ApiError } from '../utils/apiError';

export class AdminDashboardService {
  static async getStats() {
    const [
      totalOrders,
      pendingOrders,
      totalCustomers,
      totalProducts,
      lowStockProductsCount,
      revenueResult,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: ORDER_STATUS.PENDING }),
      User.countDocuments({ role: USER_ROLES.CUSTOMER }),
      Product.countDocuments(),
      Product.countDocuments({ stock: { $lte: 5 } }),
      Order.aggregate([
        { $match: { paymentStatus: PAYMENT_STATUS.PAID } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5),
    ]);

    const totalRevenue = revenueResult.length > 0 ? roundPrice(revenueResult[0].totalRevenue) : 0;

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      lowStockProducts: lowStockProductsCount,
      recentOrders: recentOrders.map((o) => o.toJSON()),
    };
  }

  static async getSalesReport(period: 'daily' | 'monthly' = 'daily') {
    const days = period === 'daily' ? 30 : 365;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const dateFormat = period === 'daily' ? '%Y-%m-%d' : '%Y-%m';

    const sales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sinceDate },
          paymentStatus: PAYMENT_STATUS.PAID,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          totalSales: { $sum: '$total' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return sales.map((s) => ({
      date: s._id,
      revenue: roundPrice(s.totalSales),
      orders: s.orderCount,
    }));
  }

  static async getCustomers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const query: any = { role: USER_ROLES.CUSTOMER };

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const [customers, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      customers: customers.map((c) => c.toJSON()),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  static async getCustomerById(customerId: string) {
    const customer = await User.findById(customerId);
    if (!customer) {
      throw ApiError.notFound('Customer not found.');
    }

    const orders = await Order.find({ user: customer._id }).sort({ createdAt: -1 });

    return {
      customer: customer.toJSON(),
      orders: orders.map((o) => o.toJSON()),
    };
  }

  static async getInventoryAlerts(threshold = 10) {
    const lowStockProducts = await Product.find({
      stock: { $lte: threshold },
    }).sort({ stock: 1 });

    return lowStockProducts.map((p) => p.toJSON());
  }

  static async getContactMessages(status?: string) {
    const query = status && status !== 'all' ? { status } : {};
    const messages = await ContactMessage.find(query).sort({ createdAt: -1 });
    return messages.map((m) => m.toJSON());
  }
}

