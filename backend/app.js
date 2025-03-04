const express = require("express");
require("express-async-errors");
const morgan = require("morgan");
const cors = require("cors");
const csurf = require("csurf");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const routes = require('./routes');

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

module.exports = app;
