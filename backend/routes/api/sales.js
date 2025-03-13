const express = require("express");
const { requireAuth } = require("../../utils/auth");
const { Sale } = require("../../db/models");
const { validateSaleQueryParams, validateCreateSale } = require("../../utils/validation");

const router = express.Router();

//Delete sale by ID
router.delete("/:id", requireAuth, async (req, res, next) => {
	const saleId = req.params.id;
	const { user } = req;
	const sale = await Sale.findByPk(saleId);

	if (!sale) {
		const err = new Error("Sale not found");
		err.title = "Not Found";
		err.status = 404;
		return next(err);
	}

	if (sale.userId !== user.id) {
		const err = new Error("Forbidden - Only the user who created the sale can delete this sale");
		err.title = "Forbidden";
		err.status = 403;
		return next(err);
	}

	await sale.destroy();

	return res.json({
		message: "Sale deleted",
	});
});

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
