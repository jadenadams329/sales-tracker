const express = require("express");
require("express-async-errors");
const morgan = require("morgan");
const cors = require("cors");
const csurf = require("csurf");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const { ValidationError } = require("sequelize");

//check if we are in production or not
const { environment } = require("./config");
const isProduction = environment === "production";

const app = express();

//morgan middleware for logging
app.use(morgan("dev"));

//middleware for parsing cookies
app.use(cookieParser());

//middleware for parsing JSON bodies
app.use(express.json());


//SECURITY MIDDLEWARE
/*---------------------------------------------------------------------------------------------------------------------------- */

//cors only in development
if (!isProduction) {
	app.use(cors());
}

// helmet helps set a variety of headers to better secure the app
app.use(
	helmet.crossOriginResourcePolicy({
		policy: "cross-origin",
	})
);

// Set the _csrf token and create req.csrfToken method
app.use(
	csurf({
		cookie: {
			secure: isProduction,
			sameSite: isProduction && "Lax",
			httpOnly: true,
		},
	})
);

app.use(routes); // Connect all the routes

//ERROR HANDLING MIDDLEWARE
/*---------------------------------------------------------------------------------------------------------------------------- */
// Catch unhandled requests and forward to error handler.
app.use((_req, _res, next) => {
	const err = new Error("The requested resource couldn't be found.");
	err.title = "Resource Not Found";
	err.errors = { message: "The requested resource couldn't be found." };
	err.status = 404;
	next(err);
});

// Process sequelize errors
app.use((err, _req, _res, next) => {
	// check if error is a Sequelize error:
	if (err instanceof ValidationError) {
		let errors = {};
		for (let error of err.errors) {
			errors[error.path] = error.message;
		}
		err.title = "Validation error";
		err.errors = errors;
	}
	next(err);
});

// Error formatter
app.use((err, _req, res, _next) => {
	res.status(err.status || 500);
	console.error(err);
	res.json({
		title: err.title || "Server Error",
		message: err.message,
		errors: err.errors,
		stack: isProduction ? null : err.stack,
	});
});

module.exports = app;
