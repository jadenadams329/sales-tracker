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

const validateSignup = [
	check("email").exists({ checkFalsy: true }).isEmail().withMessage("Please provide a valid email."),
	check("password")
		.exists({ checkFalsy: true })
		.isLength({ min: 6 })
		.withMessage("Password must be 6 characters or more."),
	check("firstName")
		.exists({ checkFalsy: true })
		.isLength({ min: 1 })
		.withMessage("First Name must be 1 character or more"),
	check("lastName")
		.exists({ checkFalsy: true })
		.isLength({ min: 1 })
		.withMessage("Last Name must be 1 character or more"),
	check("role")
		.exists({ checkFalsy: true })
		.withMessage("Role must be assigned")
		.isIn(["Admin", "Team Lead", "Closer"])
		.withMessage("Role must be 'Admin', 'Team Lead', or 'Closer'"),
	handleValidationErrors,
];

const validateSaleQueryParams = [
	check("page").optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage("Page must be greater than or equal to 1"),
	check("size").optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage("Size must be greater than or equal to 1"),
	check("serviceDateFrom")
		.optional({ checkFalsy: true })
		.isDate({
			format: "MM-DD-YYYY",
			strictMode: true,
			delimiters: ["-"],
		})
		.withMessage("Must be valid Date"),
	check("serviceDateTo")
		.optional({ checkFalsy: true })
		.isDate({
			format: "MM-DD-YYYY",
			strictMode: true,
			delimiters: ["-"],
		})
		.withMessage("Must be valid Date"),
	check("serviced")
		.optional({ checkFalsy: true })
		.isIn(["Pending", "Yes", "No"])
		.withMessage("Serviced must be Pending, Yes, or No"),
	handleValidationErrors,
];

const validateCreateSale = [
	check("accountNumber")
		.exists({ checkFalsy: true })
		.withMessage("Account number required")
		.bail()
		.isInt({ min: 1 })
		.withMessage("Account number must be a number greater than 1"),

	check("agreementLength")
		.exists({ checkFalsy: true })
		.withMessage("Agreement length is required")
		.bail()
		.isIn(["One-time", "12 Months", "24 Months"])
		.withMessage("Agreement length must be 'One-time', '12 Months', or '24 Months'"),

	check("planType")
		.exists({ checkFalsy: true })
		.withMessage("Plan type is required")
		.bail()
		.isIn(["One-time", "Basic", "Pro", "Premium"])
		.withMessage("Plan type must be 'One-time', 'Basic', 'Pro', or 'Premium'"),

	check("initialPrice").exists({ checkFalsy: true }).withMessage("Initial price is required"),

	check("monthlyPrice").exists({ checkFalsy: true }).withMessage("Monthly price is required"),

	check("autopay")
		.exists({ checkFalsy: true })
		.withMessage("Autopay is required")
		.bail()
		.isIn(["None", "CC", "ACH"])
		.withMessage("Autopay must be 'None', 'CC', or 'ACH'"),

	check("serviceDate")
		.exists()
		.withMessage("Service date is required")
		.bail()
		.isDate({ format: "MM-DD-YYYY", strictMode: true })
		.withMessage("Service date must be a valid date in MM-DD-YYYY format"),

	check("serviced").optional().isIn(["Yes", "No", "Pending"]).withMessage("Serviced must be 'Yes', 'No', or 'Pending'"),

	check("notes").optional().isString().withMessage("Notes must be a string"),

	handleValidationErrors,
];

const validateUpdateSale = [
	// accountNumber: Optional, if present must be an integer >= 1
	check("accountNumber")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Account number must be an integer greater than or equal to 1"),

	// agreementLength: Optional, if present must be one of the ENUM values
	check("agreementLength")
		.optional()
		.isIn(["One-time", "12 Months", "24 Months"])
		.withMessage("Agreement length must be 'One-time', '12 Months', or '24 Months'"),

	// planType: Optional, if present must be one of the ENUM values
	check("planType")
		.optional()
		.isIn(["One-time", "Basic", "Pro", "Premium"])
		.withMessage("Plan type must be 'One-time', 'Basic', 'Pro', or 'Premium'"),

	// initialPrice: Optional, if present must be a decimal number
	check("initialPrice")
		.optional()
		.isInt({ min: 0 })
		.withMessage("Initial price must be a number greater than or equal to 0"),

	// monthlyPrice: Optional, if present must be a decimal number
	check("monthlyPrice").optional().isInt({ min: 1 }).withMessage("Monthly price must be a number greater than 1"),

	// autopay: Optional, if present must be one of the ENUM values
	check("autopay").optional().isIn(["None", "CC", "ACH"]).withMessage("Autopay must be 'None', 'CC', or 'ACH'"),

	// serviceDate: Optional, if present must be a date in MM-DD-YYYY format
	check("serviceDate")
		.optional()
		.isDate({ format: "MM-DD-YYYY", strictMode: true })
		.withMessage("Service date must be a valid date in MM-DD-YYYY format"),

	// serviced: Optional, if present must be one of the ENUM values
	check("serviced").optional().isIn(["Yes", "No", "Pending"]).withMessage("Serviced must be 'Yes', 'No', or 'Pending'"),

	// notes: Optional, if present must be a string
	check("notes").optional().isString().withMessage("Notes must be a string"),

	handleValidationErrors,
];

module.exports = {
	handleValidationErrors,
	validateSaleQueryParams,
	validateCreateSale,
	validateSignup,
	validateUpdateSale,
};
