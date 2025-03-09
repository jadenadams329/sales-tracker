import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../app";
const { User, sequelize } = require("../db/models");

describe("User Auth - Login Route", () => {
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
        await sequelize.sync({ force: true })
		await User.destroy({ where: {}, truncate: true, cascade: true });

		const hashedPassword = bcrypt.hashSync(testUser.password, 10);
		await User.create({
			...testUser,
			password: hashedPassword,
		});

		// Get a fresh CSRF token before each test
		const csrfResponse = await agent.get("/api/csrf/restore");

		// Store token for use in tests
		agent.csrfToken = csrfResponse.body["XSRF-Token"];
	});

	it("should successfully log in with valid credentials", async () => {

		const response = await agent
			.post("/api/session")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send({
				email: testUser.email,
				password: testUser.password,
			})
			.set("Accept", "application/json");

		// Verify successful response
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

	it("should reject login with invalid email", async () => {
		const response = await agent
			.post("/api/session")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send({
				email: "wrong@example.com",
				password: testUser.password,
			})
			.set("Accept", "application/json");

		expect(response.status).toBe(401);
		expect(response.body).toHaveProperty("errors");
		expect(response.body.errors.credential).toBe("The provided credentials were invalid.");
	});

	it("should reject login with invalid password", async () => {

		const response = await agent
			.post("/api/session")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send({
				email: testUser.email,
				password: "wrongpassword",
			})
			.set("Accept", "application/json");

		expect(response.status).toBe(401);
		expect(response.body).toHaveProperty("errors");
		expect(response.body.errors.credential).toBe("The provided credentials were invalid.");
	});

	it("should handle missing credentials", async () => {
		const response = await agent
			.post("/api/session")
            .set("XSRF-TOKEN", agent.csrfToken)
			.send({
				email: testUser.email,
				// Missing password
			})
			.set("Accept", "application/json");

		expect(response.status).toBe(401);
		expect(response.body).toHaveProperty("errors");
        expect(response.body.errors.credential).toBe("The provided credentials were invalid.");
	});
});
