"use strict";
const { Model, Validator } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		static associate(models) {
			User.hasMany(models.Sale, {foreignKey: "userId"})
		}
	}

	User.init(
		{
			email: {
				type: DataTypes.TEXT,
				allowNull: false,
				unique: true,
				validate: {
					len: [3, 1000],
					isEmail: true,
				},
			},

			password: {
				type: DataTypes.STRING.BINARY,
				allowNull: false,
				validate: {
					len: [60, 60],
				},
			},

			firstName: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: true,
				},
			},

			lastName: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: true,
				},
			},

			role: {
				type: DataTypes.ENUM("Admin", "Team Lead", "Closer"),
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: "User",
			tableName: "Users",
			defaultScope: {
				attributes: {
					exclude: ["password", "createdAt", "updatedAt"],
				},
			},
		}
	);
	return User;
};
