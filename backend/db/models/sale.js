"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class Sale extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			Sale.belongsTo(models.User, { foreignKey: "userId" });
		}
	}
	Sale.init(
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			accountNumber: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			agreementLength: {
				type: DataTypes.ENUM("One-time", "12 Months", "24 Months"),
				allowNull: false,
			},
			planType: {
				type: DataTypes.ENUM("One-time", "Basic", "Pro", "Premium"),
				allowNull: false,
			},
			initialPrice: {
				type: DataTypes.DECIMAL,
				allowNull: false,
			},
			monthlyPrice: {
				type: DataTypes.DECIMAL,
				allowNull: false,
			},
			autopay: {
				type: DataTypes.ENUM("None", "CC", "ACH"),
				allowNull: false,
			},
			serviceDate: {
				type: DataTypes.DATEONLY,
				allowNull: false,
			},
			servcied: {
				type: DataTypes.ENUM("Yes", "No", "Pending"),
				allowNull: false,
        defaultValue: "Pending"
			},
			notes: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
		},
		{
			sequelize,
			modelName: "Sale",
		}
	);
	return Sale;
};
