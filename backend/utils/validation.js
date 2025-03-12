const { validationResult } = require("express-validator");
const { check } = require("express-validator");

// middleware for formatting errors from express-validator middleware
// (to customize, see express-validator's documentation)
const handleValidationErrors = (req, _res, next) => {
	const validationErrors = validationResult(req);

	if (!validationErrors.isEmpty()) {
		const errors = {};
		validationErrors.array().forEach((error) => (errors[error.path] = error.msg));

		const err = Error("Bad request.");
		err.errors = errors;
		err.status = 400;
		err.title = "Bad request.";
		next(err);
	}
	next();
};

const validateSaleQueryParams = [
	check("page").optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage("Page must be greater than or equal to 1"),
	check("size").optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage("Size must be greater than or equal to 1"),
	check("serviceDateFrom").optional({ checkFalsy: true }).isDate({
		format: 'MM-DD-YYYY',
		strictMode: true,
		delimiters: ['-']
	  }).withMessage("Must be valid Date"),
	check("serviceDateTo").optional({ checkFalsy: true }).isDate({
		format: 'MM-DD-YYYY',
		strictMode: true,
		delimiters: ['-']
	  }).withMessage("Must be valid Date"),
	check("serviced")
		.optional({ checkFalsy: true })
		.isIn(["Pending", "Yes", "No"])
		.withMessage("Serviced must be Pending, Yes, or No"),
	handleValidationErrors,
];

module.exports = {
	handleValidationErrors,
	validateSaleQueryParams,
};
