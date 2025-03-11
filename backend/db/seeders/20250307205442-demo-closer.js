"use strict";
/** @type {import('sequelize-cli').Migration} */
const { User } = require("../models");
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === "production") {
	options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
	async up(queryInterface, Sequelize) {
		await User.bulkCreate(
			[
				{
					email: "demo.closer@goaptive.com",
					password: bcrypt.hashSync("password"),
					firstName: "Closer",
					lastName: "Demo",
					role: "Closer",
				},
				{
					email: "demo.teamlead@goaptive.com",
					password: bcrypt.hashSync("password"),
					firstName: "Team Lead",
					lastName: "Demo",
					role: "Team Lead",
				},
				{
					email: "demo.admin@goaptive.com",
					password: bcrypt.hashSync("password"),
					firstName: "Admin",
					lastName: "Demo",
					role: "Admin",
				},
			],
			{ validate: true }
		);
	},

	async down(queryInterface, Sequelize) {
		options.tableName = "Users";
		const Op = Sequelize.Op;
		return queryInterface.bulkDelete(
			options,
			{
				email: { [Op.in]: ["demo.closer@goaptive.com", "demo.teamlead@goaptive.com", "demo.admin@goaptive.com"] },
			},
			{}
		);
	},
};
