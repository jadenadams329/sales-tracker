'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === "production") {
	options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sales', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      accountNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      agreementLength: {
        type: Sequelize.ENUM("One-time", "12 Months", "24 Months"),
        allowNull: false
      },
      planType: {
        type: Sequelize.ENUM("One-time", "Basic", "Pro", "Premium"),
        allowNull: false
      },
      initialPrice: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      monthlyPrice: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      autopay: {
        type: Sequelize.ENUM("None", "CC", "ACH"),
        allowNull: false
      },
      serviceDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      servcied: {
        type: Sequelize.ENUM("Pending", "Yes", "No"),
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      }
    }, options);
  },
  async down(queryInterface, Sequelize) {
    options.tableName = "Sales"
    return queryInterface.dropTable(options)
  }
};
