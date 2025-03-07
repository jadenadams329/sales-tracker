"use strict";
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === "production") {
	options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable(
			"Users",
			{
				id: {
					allowNull: false,
					autoIncrement: true,
					primaryKey: true,
					type: Sequelize.INTEGER,
				},
				email: {
					type: Sequelize.TEXT,
					allowNull: false,
					unique: true,
				},
				password: {
					type: Sequelize.STRING.BINARY,
					allowNull: false,
				},
				firstName: {
					type: Sequelize.STRING,
					allowNull: false,
				},
				lastName: {
					type: Sequelize.STRING,
					allowNull: false,
				},
				role: {
					type: Sequelize.ENUM("Admin", "Team Lead", "Closer"),
					allowNull: false,
				},
				createdAt: {
					allowNull: false,
					type: Sequelize.DATE,
					defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
				},
				updatedAt: {
					allowNull: false,
					type: Sequelize.DATE,
					defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
				},
			},
			options
		);
	},
	async down(queryInterface, Sequelize) {
		options.tableName = "Users";
		return queryInterface.dropTable(options);
	},
};
