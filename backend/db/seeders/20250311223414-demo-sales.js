"use strict";
const { Sale } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
	options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
	async up(queryInterface, Sequelize) {
		(options.tableName = "Sales"), (options.validate = true);
		await Sale.bulkCreate(
			[
				{
					userId: 1,
					accountNumber: 356647,
					agreementLength: "24 Months",
					planType: "Pro",
					initialPrice: 99,
					monthlyPrice: 70,
					autopay: "CC",
					serviceDate: "03/20/2025",
					notes: "Send follow up email",
				},
				{
					userId: 1,
					accountNumber: 356648,
					agreementLength: "12 Months",
					planType: "Premium",
					initialPrice: 99,
					monthlyPrice: 99,
					autopay: "ACH",
					serviceDate: "03/20/2025",
					notes: "Send follow up email",
				},
			],
			options
		);
	},

	async down(queryInterface, Sequelize) {
		const Op = Sequelize.Op;
		options.tableName = "Sales";
		return queryInterface.bulkDelete(options, {
			userId: { [Op.in]: [1] },
		});
	},
};
