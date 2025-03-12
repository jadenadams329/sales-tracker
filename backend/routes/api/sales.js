const express = require("express");
const { requireAuth } = require("../../utils/auth");
const { Sale } = require("../../db/models");
const { validateSaleQueryParams, validateCreateSale } = require("../../utils/validation");

const router = express.Router();

//Get all sales
router.get("/", requireAuth, validateSaleQueryParams, async (req, res, next) => {
	try {
		const { user } = req;

		const sales = await Sale.getAllSales(req.query, user.id);

		res.json({
			data: sales,
		});
	} catch (err) {
		next(err);
	}
});

//Add a sale
router.post("/", requireAuth, validateCreateSale, async (req, res, next) => {
	try {
		const { user } = req;
		const {
			accountNumber,
			agreementLength,
			planType,
			initialPrice,
			monthlyPrice,
			autopay,
			serviceDate,
			serviced,
			notes,
		} = req.body;

		const newSale = await Sale.create({
			userId: user.id,
			accountNumber,
			agreementLength,
			planType,
			initialPrice,
			monthlyPrice,
			autopay,
			serviceDate,
			serviced,
			notes,
		});

		const sale = await Sale.findByPk(newSale.id);

		return res.status(201).json(sale);
	} catch (err) {
		next(err);
	}
});

module.exports = router;
