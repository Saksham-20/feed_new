// backend/models/Order.js - Order management model
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_number: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  order_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'completed', 'cancelled', 'on_hold'),
    defaultValue: 'pending'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  tax_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  discount_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'INR'
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'partial', 'paid', 'refunded', 'cancelled'),
    defaultValue: 'pending'
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  shipping_address: {
    type: DataTypes.JSON,
    allowNull: true
  },
  billing_address: {
    type: DataTypes.JSON,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  internal_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  tableName: 'orders',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (order) => {
      if (!order.order_number) {
        const currentYear = new Date().getFullYear();
        const count = await Order.count({
          where: sequelize.where(
            sequelize.fn('YEAR', sequelize.col('created_at')),
            currentYear
          )
        });
        order.order_number = `ORD-${currentYear}-${String(count + 1).padStart(4, '0')}`;
      }
      
      // Calculate totals
      if (order.items && Array.isArray(order.items)) {
        order.subtotal = order.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        order.total_amount = order.subtotal + order.tax_amount - order.discount_amount;
      }
    },
    beforeUpdate: (order) => {
      // Recalculate totals if items changed
      if (order.changed('items') && order.items && Array.isArray(order.items)) {
        order.subtotal = order.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        order.total_amount = order.subtotal + order.tax_amount - order.discount_amount;
      }
    }
  },
  indexes: [
    {
      fields: ['order_number']
    },
    {
      fields: ['client_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['order_date']
    },
    {
      fields: ['assigned_to']
    }
  ]
});

module.exports = Order;