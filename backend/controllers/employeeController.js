// backend/controllers/employeeController.js - Employee controller
const { Op } = require('sequelize');
const User = require('../models/User');
const Order = require('../models/Order');
const Bill = require('../models/Bill');

const employeeController = {
  // Sales employee dashboard
  getSalesDashboard: async (req, res) => {
    try {
      const userId = req.user.id;
      const today = new Date();
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Sales statistics
      const [
        totalOrders,
        monthlyOrders,
        totalRevenue,
        monthlyRevenue,
        recentOrders
      ] = await Promise.all([
        Order.count({
          where: {
            [Op.or]: [
              { created_by: userId },
              { assigned_to: userId }
            ]
          }
        }),
        Order.count({
          where: {
            [Op.or]: [
              { created_by: userId },
              { assigned_to: userId }
            ],
            created_at: { [Op.gte]: thisMonth }
          }
        }),
        Order.sum('total_amount', {
          where: {
            [Op.or]: [
              { created_by: userId },
              { assigned_to: userId }
            ]
          }
        }) || 0,
        Order.sum('total_amount', {
          where: {
            [Op.or]: [
              { created_by: userId },
              { assigned_to: userId }
            ],
            created_at: { [Op.gte]: thisMonth }
          }
        }) || 0,
        Order.findAll({
          where: {
            [Op.or]: [
              { created_by: userId },
              { assigned_to: userId }
            ]
          },
          include: [{ model: User, as: 'client', attributes: ['fullname'] }],
          order: [['created_at', 'DESC']],
          limit: 10
        })
      ]);

      res.json({
        success: true,
        data: {
          orders: {
            total: totalOrders,
            thisMonth: monthlyOrders,
            recent: recentOrders
          },
          revenue: {
            total: totalRevenue,
            thisMonth: monthlyRevenue
          }
        }
      });

    } catch (error) {
      console.error('Sales dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sales dashboard data'
      });
    }
  },

  // Marketing employee dashboard
  getMarketingDashboard: async (req, res) => {
    try {
      const userId = req.user.id;

      // For now, return basic data since we don't have Campaign/Lead models
      const stats = {
        campaigns: { active: 0, total: 0 },
        leads: { total: 0, converted: 0 },
        conversionRate: 0
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Marketing dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch marketing dashboard data'
      });
    }
  },

  // Office employee dashboard
  getOfficeDashboard: async (req, res) => {
    try {
      const userId = req.user.id;

      // For now, return basic data since we don't have Task/Document models
      const stats = {
        tasks: { pending: 0, completed: 0, overdue: 0 },
        documents: { total: 0, recent: [] },
        reports: { thisMonth: 0, pending: 0 }
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Office dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch office dashboard data'
      });
    }
  }
};

module.exports = employeeController;