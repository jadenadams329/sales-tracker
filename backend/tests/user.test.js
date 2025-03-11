import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../app";
const { User, sequelize } = require("../db/models");

describe("Users - Signup User Endpoint", () => {
	const testUser = {
		email: "test@test.com",
		password: "password",
		firstName: "Test",
		lastName: "User",
		role: "Closer",
	};

	//creating an agent that will maintain cookies accross tests
	const agent = request.agent(app);

	//Before each test
	beforeEach(async () => {
		await sequelize.sync({ force: true });
		await User.destroy({ where: {}, truncate: true, cascade: true });

		// Get a fresh CSRF token before each test
		const csrfResponse = await agent.get("/api/csrf/restore");

		// Store token for use in tests
		agent.csrfToken = csrfResponse.body["XSRF-Token"];
	});

	it("should successfully sign up the user with valid credentials", async () => {
		const response = await agent
			.post("/api/users")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send({
				...testUser,
			})
			.set("Accept", "application/json");

		//verify successful response
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("user");
		expect(response.body.user.email).toBe(testUser.email);
		expect(response.body.user.firstName).toBe(testUser.firstName);
		expect(response.body.user.lastName).toBe(testUser.lastName);
		expect(response.body.user.role).toBe(testUser.role);

		// Verify cookie was set
		expect(response.headers["set-cookie"]).toBeDefined();
		const cookieHeader = response.headers["set-cookie"][0];
		expect(cookieHeader).toContain("token=");
	});

	it("should reject sign up with duplicate email", async () => {
		const hashedPassword = bcrypt.hashSync(testUser.password, 10);
		await User.create({
			...testUser,
			password: hashedPassword,
		});
		const response = await agent
			.post("/api/users")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send({
				...testUser,
			})
			.set("Accept", "application/json");

		expect(response.status).toBe(409);
		expect(response.body).toHaveProperty("errors");
		expect(response.body.errors.credential).toBe("The provided email is already registered");
	});

	//passed
	it("should reject sign up with missing required fields", async () => {
		const response = await agent
			.post("/api/users")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send({
				email: testUser.email,
				// missing password, firstName, lastName, role
			})
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("errors");
		expect(response.body.errors).toHaveProperty("password");
		expect(response.body.errors).toHaveProperty("firstName");
		expect(response.body.errors).toHaveProperty("lastName");
		expect(response.body.errors).toHaveProperty("role");
	});
	//passed
	it("should reject sign up with invalid email format", async () => {
		const response = await agent
			.post("/api/users")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send({
				...testUser,
				email: "invalid-email",
			})
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("errors");
		expect(response.body.errors).toHaveProperty("email");
	});
	//passed
	it("should reject sign up with password too short", async () => {
		const response = await agent
			.post("/api/users")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send({
				...testUser,
				password: "short",
			})
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("errors");
		expect(response.body.errors).toHaveProperty("password");
	});
	//passed
	it("should reject sign up with invalid role", async () => {
		const response = await agent
			.post("/api/users")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send({
				...testUser,
				role: "InvalidRole",
			})
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("errors");
		expect(response.body.errors).toHaveProperty("role");
	});

	it("should reject sign up without CSRF token", async () => {
		const response = await agent
			.post("/api/users")
			.send({
				...testUser,
			})
			.set("Accept", "application/json");

		expect(response.status).toBe(403);
		expect(response.body).toHaveProperty("message");
		expect(response.body.message).toContain("invalid csrf token");
	});

	it("should not return password in user response", async () => {
		const hashedPassword = bcrypt.hashSync(testUser.password, 10);
		const response = await agent
			.post("/api/users")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send({
				...testUser,
				password: hashedPassword,
			})
			.set("Accept", "application/json");

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("user");
		expect(response.body.user).not.toHaveProperty("password");
		expect(response.body.user).not.toHaveProperty("hashedPassword");
	});
});
