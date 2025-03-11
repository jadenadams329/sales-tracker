const express = require("express");
const bcrypt = require("bcryptjs");

const { setTokenCookie, requireAuth } = require("../../utils/auth");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const { User } = require("../../db/models");

const router = express.Router();

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

//Sign up
router.post("/", validateSignup, async (req, res, next) => {
	const { email, password, firstName, lastName, role } = req.body;
	try {
		// Check if user with email already exists
		const existingUser = await User.findOne({
			where: { email },
		});

		if (existingUser) {
			const err = new Error("User already exists");
			err.status = 409;
			err.title = "Signup failed";
			err.errors = { credential: "The provided email is already registered" };
			return next(err);
		}

		// Hash password
		const hashedPassword = bcrypt.hashSync(password, 10);

		// Create new user
		const user = await User.create({
			email,
			firstName,
			lastName,
			password: hashedPassword,
			role,
		});

		// Set token cookie for authentication
		const safeUser = {
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			role: user.role,
		};

		await setTokenCookie(res, safeUser);

		return res.json({
			user: safeUser,
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;
