// backend/controllers/clientController.js - Client controller
const { Op } = require('sequelize');
const User = require('../models/User');
const Order = require('../models/Order');
const Bill = require('../models/Bill');

const clientController = {
  // Get dashboard overview
  getDashboardOverview: async (req, res) => {
    try {
      const clientId = req.user.id;
      const today = new Date();
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

      // Get client statistics
      const [orderCount, billCount, recentOrders, recentBills] = await Promise.all([
        Order.count({ where: { client_id: clientId } }),
        Bill.count({ where: { client_id: clientId } }),
        Order.findAll({
          where: { client_id: clientId },
          order: [['created_at', 'DESC']],
          limit: 5
        }),
        Bill.findAll({
          where: { client_id: clientId },
          order: [['created_at', 'DESC']],
          limit: 5
        })
      ]);

      res.json({
        success: true,
        data: {
          orders: { total: orderCount, recent: recentOrders },
          bills: { total: billCount, recent: recentBills }
        }
      });

    } catch (error) {
      console.error('Client dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data'
      });
    }
  },

  // Get client orders
  getOrders: async (req, res) => {
    try {
      const clientId = req.user.id;
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      const where = { client_id: clientId };
      if (status) where.status = status;

      const { count, rows } = await Order.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          orders: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit),
            limit: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders'
      });
    }
  },

  // Get single order
  getOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const clientId = req.user.id;

      const order = await Order.findOne({
        where: { id, client_id: clientId }
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        data: { order }
      });

    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order'
      });
    }
  },

  // Create new order
  createOrder: async (req, res) => {
    try {
      const clientId = req.user.id;
      const { items, due_date, notes, priority = 'medium' } = req.body;

      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const tax_amount = subtotal * 0.18; // 18% GST
      const total_amount = subtotal + tax_amount;

      const orderData = {
        client_id: clientId,
        items,
        due_date,
        notes,
        priority,
        subtotal,
        tax_amount,
        total_amount,
        created_by: clientId
      };

      const order = await Order.create(orderData);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: { order }
      });

    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create order'
      });
    }
  },

  // Get client bills
  getBills: async (req, res) => {
    try {
      const clientId = req.user.id;
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      const where = { client_id: clientId };
      if (status) where.status = status;

      const { count, rows } = await Bill.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          bills: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit),
            limit: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get bills error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bills'
      });
    }
  },

  // Get single bill
  getBill: async (req, res) => {
    try {
      const { id } = req.params;
      const clientId = req.user.id;

      const bill = await Bill.findOne({
        where: { id, client_id: clientId },
        include: [
          { model: Order, as: 'order', attributes: ['order_number', 'items'] }
        ]
      });

      if (!bill) {
        return res.status(404).json({
          success: false,
          message: 'Bill not found'
        });
      }

      res.json({
        success: true,
        data: { bill }
      });

    } catch (error) {
      console.error('Get bill error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bill'
      });
    }
  }
};

module.exports = clientController;