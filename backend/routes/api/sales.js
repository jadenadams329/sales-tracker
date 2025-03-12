const express = require("express");
const { requireAuth } = require("../../utils/auth");
const { Sale } = require("../../db/models");
const { validateSaleQueryParams } = require("../../utils/validation");

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

module.exports = router;
