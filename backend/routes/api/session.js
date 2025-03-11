const express = require("express");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { setTokenCookie, restoreUser } = require("../../utils/auth");
const { User } = require("../../db/models");
const router = express.Router();

//log in
router.post("/", async (req, res, next) => {
	const { email, password } = req.body;

	// First check if both email and password are provided
	if (!email || !password) {
		const err = new Error("Login failed");
		err.status = 401;
		err.title = "Login failed";
		err.errors = { credential: "The provided credentials were invalid." };
		return next(err);
	}

	const user = await User.unscoped().findOne({
		where: {
			email,
		},
	});

	if (!user || !bcrypt.compareSync(password, user.password.toString())) {
		const err = new Error("Login failed");
		err.status = 401;
		err.title = "Login failed";
		err.errors = { credential: "The provided credentials were invalid." };
		return next(err);
	}

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
});

//log out
router.delete("/", (req, res) => {
	res.clearCookie("token");
	return res.json({ message: "success" });
});

//get session
router.get("/", (req, res) => {
	const { user } = req;
	console.log(user)
	if (user) {
		const safeUser = {
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			role: user.role,
		};

		return res.json({
			user: safeUser,
		});
	} else {
		return res.json({ user: null });
	}
});

module.exports = router;
