// backend/controllers/adminController.js - Admin controller
const { Op } = require('sequelize');
const User = require('../models/User');
const Order = require('../models/Order');
const Bill = require('../models/Bill');
const { FeedbackThread } = require('../models/FeedbackThread');

const adminController = {
  // Get dashboard overview
  getDashboardOverview: async (req, res) => {
    try {
      const today = new Date();
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

      // User statistics
      const [userStats, pendingApprovals] = await Promise.all([
        User.count({ group: ['role'] }),
        User.count({
          where: { 
            status: 'pending', 
            role: { [Op.in]: ['sales_purchase', 'marketing', 'office'] }
          }
        })
      ]);

      // Order statistics
      const orderCount = await Order.count();
      const billCount = await Bill.count();
      const feedbackCount = await FeedbackThread.count();

      res.json({
        success: true,
        data: {
          users: { total: await User.count(), pending: pendingApprovals },
          orders: { total: orderCount },
          bills: { total: billCount },
          feedback: { total: feedbackCount }
        }
      });

    } catch (error) {
      console.error('Dashboard overview error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard overview'
      });
    }
  },

  // Get users with pagination
  getUsers: async (req, res) => {
    try {
      const { page = 1, limit = 10, role, status } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (role) where.role = role;
      if (status) where.status = status;

      const { count, rows } = await User.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        attributes: { exclude: ['password_hash'] },
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          users: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit),
            limit: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  },

  // Get pending approvals
  getPendingApprovals: async (req, res) => {
    try {
      const pendingUsers = await User.findAll({
        where: { 
          status: 'pending',
          role: { [Op.in]: ['sales_purchase', 'marketing', 'office'] }
        },
        attributes: { exclude: ['password_hash'] },
        order: [['created_at', 'ASC']]
      });

      res.json({
        success: true,
        data: { users: pendingUsers }
      });

    } catch (error) {
      console.error('Get pending approvals error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pending approvals'
      });
    }
  },

  // Approve user
  approveUser: async (req, res) => {
    try {
      const { userId } = req.body;
      const adminId = req.user.id;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.update({
        status: 'active',
        approved_by: adminId,
        approved_at: new Date()
      });

      res.json({
        success: true,
        message: 'User approved successfully',
        data: { user: user.toJSON() }
      });

    } catch (error) {
      console.error('Approve user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve user'
      });
    }
  },

  // Reject user
  rejectUser: async (req, res) => {
    try {
      const { userId, reason } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.update({ status: 'rejected' });

      res.json({
        success: true,
        message: 'User rejected successfully'
      });

    } catch (error) {
      console.error('Reject user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reject user'
      });
    }
  }
};

module.exports = adminController;