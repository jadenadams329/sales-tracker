"use strict";
const { Model, Op } = require("sequelize");

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

		static async getAllSales(params, userId) {
			let { page, size, serviceDateFrom, serviceDateTo, serviced } = params;

			// Convert page and size to numbers if provided
			if (page) {
				page = +page;
				if (Number.isNaN(page) || page <= 0) page = 1;
			}
			if (size) {
				size = +size;
				if (Number.isNaN(size) || size <= 0) size = 20;
			}

			// Build the where clause starting with userId
			const where = { userId };

			// Add optional filters to the where clause
			if (serviceDateFrom && serviceDateFrom !== "") {
				where.serviceDate = { [Op.gte]: serviceDateFrom };
			}
			if (serviceDateTo && serviceDateTo !== "") {
				if (where.serviceDate) {
					where.serviceDate[Op.lte] = serviceDateTo;
				} else {
					where.serviceDate = { [Op.lte]: serviceDateTo };
				}
			}
			if (serviced && serviced !== "") {
				where.serviced = serviced;
			}

			// Set up query options with the where clause
			const queryOptions = {
				where,
				order: [
					['createdAt', 'ASC'],
					['serviceDate', 'ASC'],
					[sequelize.literal('CASE serviced WHEN \'Pending\' THEN 1 WHEN \'Yes\' THEN 2 WHEN \'No\' THEN 3 END'), 'ASC']
				]
			};

			// Apply pagination only if both page and size are provided
			if (page && size) {
				const offset = (page - 1) * size;
				queryOptions.offset = offset;
				queryOptions.limit = size;
			}

			// Define the fields and values to count
			const fieldsToCount = {
				agreementLength: ["One-time", "12 Months", "24 Months"],
				planType: ["One-time", "Basic", "Pro", "Premium"],
				autopay: ["None", "CC", "ACH"],
				serviced: ["Pending", "Yes", "No"],
			};

			// Create count promises for each field-value pair
			const countPromises = [];
			for (const [field, values] of Object.entries(fieldsToCount)) {
				if (field === "serviced" && serviced && serviced !== "") {
					// If serviced is filtered, only count the filtered value
					const specificWhere = { ...where }; // Already includes serviced filter
					countPromises.push(
						Sale.count({ where: specificWhere }).then((count) => ({
							field,
							value: serviced,
							count,
						}))
					);
				} else {
					// For other fields or unfiltered serviced, count all values
					values.forEach((value) => {
						const specificWhere = { ...where, [field]: value };
						countPromises.push(
							Sale.count({ where: specificWhere }).then((count) => ({
								field,
								value,
								count,
							}))
						);
					});
				}
			}

			// Add the findAll promise for the sales list
			const salesPromise = Sale.findAll(queryOptions);

			// Execute all queries concurrently
			const results = await Promise.all([...countPromises, salesPromise]);

			// Extract sales (last result) and counts
			const sales = results.pop();

			// Initialize counts object with all possible values set to 0
			const counts = {
				agreementLength: { "One-time": 0, "12 Months": 0, "24 Months": 0 },
				planType: { "One-time": 0, Basic: 0, Pro: 0, Premium: 0 },
				autopay: { None: 0, CC: 0, ACH: 0 },
				serviced: { Pending: 0, Yes: 0, No: 0 },
			};

			// Populate counts from results
			results.forEach((result) => {
				counts[result.field][result.value] = result.count;
			});

			// Return sales and counts together
			return { sales, counts };
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
			serviced: {
				type: DataTypes.ENUM("Yes", "No", "Pending"),
				allowNull: false,
				defaultValue: "Pending",
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
