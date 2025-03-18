import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../app";
const { User, Sale, sequelize } = require("../db/models");

describe("Get Sales endpoint", () => {
	const testUser = {
		email: "test@test.com",
		password: "password",
		firstName: "Test",
		lastName: "User",
		role: "Closer",
	};

	// Agent to maintain cookies across requests
	const agent = request.agent(app);

	// Sample sales data for testing
	const sampleSales = [
		{
			accountNumber: 1001,
			agreementLength: "One-time",
			planType: "Basic",
			initialPrice: 50.0,
			monthlyPrice: 0.0,
			autopay: "None",
			serviceDate: "2023-01-01",
			serviced: "Yes",
			notes: "First sale",
		},
		{
			accountNumber: 1002,
			agreementLength: "12 Months",
			planType: "Pro",
			initialPrice: 100.0,
			monthlyPrice: 20.0,
			autopay: "CC",
			serviceDate: "2023-02-01",
			serviced: "Pending",
			notes: "Second sale",
		},
		{
			accountNumber: 1003,
			agreementLength: "24 Months",
			planType: "Premium",
			initialPrice: 200.0,
			monthlyPrice: 30.0,
			autopay: "ACH",
			serviceDate: "2023-03-01",
			serviced: "No",
			notes: "Third sale",
		},
	];

	beforeEach(async () => {
		// Reset database
		await sequelize.sync({ force: true });
		await User.destroy({ where: {}, truncate: true, cascade: true });
		await Sale.destroy({ where: {}, truncate: true, cascade: true });

		// Create test user
		const hashedPassword = bcrypt.hashSync(testUser.password, 10);
		const user = await User.create({
			...testUser,
			password: hashedPassword,
		});

		// Create sample sales for the user
		await Promise.all(sampleSales.map((sale) => Sale.create({ ...sale, userId: user.id })));

		// Log in the user and get CSRF token
		const csrfResponse = await agent.get("/api/csrf/restore");
		agent.csrfToken = csrfResponse.body["XSRF-Token"];

		await agent.post("/api/session").set("XSRF-TOKEN", agent.csrfToken).send({
			email: testUser.email,
			password: testUser.password,
		});
	});

	it("should successfully retrieve all sales with counts for authenticated user", async () => {
		const response = await agent.get("/api/sales").set("Accept", "application/json");

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("data");
		const { sales, counts } = response.body.data;

		// Verify sales array
		expect(Array.isArray(sales)).toBe(true);
		expect(sales.length).toBe(3);
		expect(sales[0]).toMatchObject(sampleSales[0]);

		// Verify counts structure
		expect(counts).toHaveProperty("agreementLength");
		expect(counts.agreementLength).toEqual({
			"One-time": 1,
			"12 Months": 1,
			"24 Months": 1,
		});
		expect(counts.planType).toEqual({
			"One-time": 0,
			Basic: 1,
			Pro: 1,
			Premium: 1,
		});
		expect(counts.autopay).toEqual({
			None: 1,
			CC: 1,
			ACH: 1,
		});
		expect(counts.serviced).toEqual({
			Pending: 1,
			Yes: 1,
			No: 1,
		});
	});

	it("should retrieve paginated sales with correct counts", async () => {
		const response = await agent.get("/api/sales?page=2&size=1").set("Accept", "application/json");

		expect(response.status).toBe(200);
		const { sales, counts } = response.body.data;

		// Pagination: page 2, size 1 -> second sale (index 1)
		expect(sales.length).toBe(1);
		expect(sales[0]).toMatchObject(sampleSales[1]);

		// Counts remain for all data, not just paginated subset
		expect(counts.agreementLength["One-time"]).toBe(1);
		expect(counts.planType.Pro).toBe(1);
		expect(counts.autopay.CC).toBe(1);
		expect(counts.serviced.Pending).toBe(1);
	});

	it("should filter sales by serviceDateFrom and serviced with correct counts", async () => {
		const response = await agent
			.get("/api/sales?serviceDateFrom=02-01-2023&serviced=Pending")
			.set("Accept", "application/json");

		expect(response.status).toBe(200);
		const { sales, counts } = response.body.data;

		// Filtered to sales on/after 2023-02-01 with serviced=Pending
		expect(sales.length).toBe(1);
		expect(sales[0]).toMatchObject(sampleSales[1]);

		// Counts reflect filtered data
		expect(counts.agreementLength).toEqual({
			"One-time": 0,
			"12 Months": 1,
			"24 Months": 0,
		});
		expect(counts.planType).toEqual({
			"One-time": 0,
			Basic: 0,
			Pro: 1,
			Premium: 0,
		});
		expect(counts.autopay).toEqual({
			None: 0,
			CC: 1,
			ACH: 0,
		});
		expect(counts.serviced).toEqual({
			Pending: 1,
			Yes: 0,
			No: 0,
		});
	});

	it("should return 401 for unauthenticated requests", async () => {
		const response = await request(app).get("/api/sales").set("Accept", "application/json");

		expect(response.status).toBe(401);
		expect(response.body).toHaveProperty("message", "Authentication required");
	});
});

describe("Add Sale endpoint", () => {
	const testUser = {
		email: "test@test.com",
		password: "password",
		firstName: "Test",
		lastName: "User",
		role: "Closer",
	};

	const agent = request.agent(app);

	const validSaleData = {
		accountNumber: 1001,
		agreementLength: "One-time",
		planType: "Basic",
		initialPrice: 50,
		monthlyPrice: 50,
		autopay: "None",
		serviceDate: "01-15-2025",
		serviced: "Pending",
		notes: "Test sale",
	};

	beforeEach(async () => {
		await sequelize.sync({ force: true });
		await User.destroy({ where: {}, truncate: true, cascade: true });
		await Sale.destroy({ where: {}, truncate: true, cascade: true });

		const hashedPassword = bcrypt.hashSync(testUser.password, 10);
		await User.create({
			...testUser,
			password: hashedPassword,
		});

		const csrfResponse = await agent.get("/api/csrf/restore");
		agent.csrfToken = csrfResponse.body["XSRF-Token"];

		await agent.post("/api/session").set("XSRF-TOKEN", agent.csrfToken).send({
			email: testUser.email,
			password: testUser.password,
		});
	});

	it("should successfully create a sale with valid data", async () => {
		const response = await agent
			.post("/api/sales")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(validSaleData)
			.set("Accept", "application/json");

		expect(response.status).toBe(201);
		expect(response.body).toMatchObject({
			userId: expect.any(Number),
			accountNumber: validSaleData.accountNumber,
			agreementLength: validSaleData.agreementLength,
			planType: validSaleData.planType,
			initialPrice: validSaleData.initialPrice,
			monthlyPrice: validSaleData.monthlyPrice,
			autopay: validSaleData.autopay,
			serviceDate: "2025-01-15",
			serviced: validSaleData.serviced,
			notes: validSaleData.notes,
		});

		const sale = await Sale.findByPk(response.body.id);
		expect(sale).not.toBeNull();
	});

	it("should fail when accountNumber is missing", async () => {
		const invalidData = { ...validSaleData };
		delete invalidData.accountNumber;

		const response = await agent
			.post("/api/sales")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(invalidData)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.errors.accountNumber).toBe("Account number required");
		expect(await Sale.count()).toBe(0);
	});

	it("should fail with invalid accountNumber (negative)", async () => {
		const invalidData = { ...validSaleData, accountNumber: -1 };

		const response = await agent
			.post("/api/sales")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(invalidData)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.errors.accountNumber).toBe("Account number must be a number greater than 1");
		expect(await Sale.count()).toBe(0);
	});

	it("should fail when agreementLength is missing", async () => {
		const invalidData = { ...validSaleData };
		delete invalidData.agreementLength;

		const response = await agent
			.post("/api/sales")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(invalidData)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.errors.agreementLength).toBe("Agreement length is required");
		expect(await Sale.count()).toBe(0);
	});

	it("should fail with invalid agreementLength", async () => {
		const invalidData = { ...validSaleData, agreementLength: "Invalid" };

		const response = await agent
			.post("/api/sales")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(invalidData)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.errors.agreementLength).toBe(
			"Agreement length must be 'One-time', '12 Months', or '24 Months'"
		);
		expect(await Sale.count()).toBe(0);
	});

	it("should fail when planType is missing", async () => {
		const invalidData = { ...validSaleData };
		delete invalidData.planType;

		const response = await agent
			.post("/api/sales")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(invalidData)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.errors.planType).toBe("Plan type is required");
		expect(await Sale.count()).toBe(0);
	});

	it("should fail with invalid planType", async () => {
		const invalidData = { ...validSaleData, planType: "Invalid" };

		const response = await agent
			.post("/api/sales")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(invalidData)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.errors.planType).toBe("Plan type must be 'One-time', 'Basic', 'Pro', or 'Premium'");
		expect(await Sale.count()).toBe(0);
	});

	it("should fail when initialPrice is missing", async () => {
		const invalidData = { ...validSaleData };
		delete invalidData.initialPrice;

		const response = await agent
			.post("/api/sales")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(invalidData)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.errors.initialPrice).toBe("Initial price is required");
		expect(await Sale.count()).toBe(0);
	});

	it("should fail when monthlyPrice is missing", async () => {
		const invalidData = { ...validSaleData };
		delete invalidData.monthlyPrice;

		const response = await agent
			.post("/api/sales")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(invalidData)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.errors.monthlyPrice).toBe("Monthly price is required");
		expect(await Sale.count()).toBe(0);
	});

	it("should fail when autopay is missing", async () => {
		const invalidData = { ...validSaleData };
		delete invalidData.autopay;

		const response = await agent
			.post("/api/sales")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(invalidData)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.errors.autopay).toBe("Autopay is required");
		expect(await Sale.count()).toBe(0);
	});

	it("should fail with invalid autopay", async () => {
		const invalidData = { ...validSaleData, autopay: "Invalid" };

		const response = await agent
			.post("/api/sales")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(invalidData)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.errors.autopay).toBe("Autopay must be 'None', 'CC', or 'ACH'");
		expect(await Sale.count()).toBe(0);
	});

	it("should fail when serviceDate is missing", async () => {
		const invalidData = { ...validSaleData };
		delete invalidData.serviceDate;

		const response = await agent
			.post("/api/sales")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(invalidData)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.errors.serviceDate).toBe("Service date is required");
		expect(await Sale.count()).toBe(0);
	});

	it("should fail with invalid serviceDate format", async () => {
		const invalidData = { ...validSaleData, serviceDate: "2025-01-15" };

		const response = await agent
			.post("/api/sales")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(invalidData)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.errors.serviceDate).toBe("Service date must be a valid date in MM-DD-YYYY format");
		expect(await Sale.count()).toBe(0);
	});

	it("should fail with invalid serviced value", async () => {
		const invalidData = { ...validSaleData, serviced: "Invalid" };

		const response = await agent
			.post("/api/sales")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(invalidData)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.errors.serviced).toBe("Serviced must be 'Yes', 'No', or 'Pending'");
		expect(await Sale.count()).toBe(0);
	});

	it("should fail with invalid notes type", async () => {
		const invalidData = { ...validSaleData, notes: 123 };

		const response = await agent
			.post("/api/sales")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(invalidData)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.errors.notes).toBe("Notes must be a string");
		expect(await Sale.count()).toBe(0);
	});

	it("should return 401 for unauthenticated requests", async () => {
		//logout first
		await agent.delete("/api/session").set("XSRF-TOKEN", agent.csrfToken).set("Accept", "application/json");

		const response = await agent
			.post("/api/sales")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(validSaleData)
			.set("Accept", "application/json");

		expect(response.status).toBe(401);
		expect(response.body.message).toBe("Authentication required");
		expect(await Sale.count()).toBe(0);
	});
});

describe("Update Sale endpoint", () => {
	const testUser = {
		email: "test@test.com",
		password: "password",
		firstName: "Test",
		lastName: "User",
		role: "Closer",
	};

	const otherUser = {
		email: "other@test.com",
		password: "password",
		firstName: "Other",
		lastName: "User",
		role: "Closer",
	};

	const agent = request.agent(app);
	let saleId;

	const initialSaleData = {
		accountNumber: 1001,
		agreementLength: "One-time",
		planType: "Basic",
		initialPrice: 50.0,
		monthlyPrice: 0.0,
		autopay: "None",
		serviceDate: "2025-01-15",
		serviced: "Pending",
		notes: "Initial sale",
	};

	beforeEach(async () => {
		await sequelize.sync({ force: true });
		await User.destroy({ where: {}, truncate: true, cascade: true });
		await Sale.destroy({ where: {}, truncate: true, cascade: true });

		// Create test user
		const hashedPassword = bcrypt.hashSync(testUser.password, 10);
		const user = await User.create({
			...testUser,
			password: hashedPassword,
		});

		// Create other user for forbidden test
		const otherHashedPassword = bcrypt.hashSync(otherUser.password, 10);
		await User.create({
			...otherUser,
			password: otherHashedPassword,
		});

		// Create a sale for the test user
		const sale = await Sale.create({ ...initialSaleData, userId: user.id });
		saleId = sale.id;

		// Log in the test user
		const csrfResponse = await agent.get("/api/csrf/restore");
		agent.csrfToken = csrfResponse.body["XSRF-Token"];

		await agent.post("/api/session").set("XSRF-TOKEN", agent.csrfToken).send({
			email: testUser.email,
			password: testUser.password,
		});
	});

	it("should successfully update a sale with a single field", async () => {
		const updateData = { accountNumber: 2002 };

		const response = await agent
			.put(`/api/sales/${saleId}`)
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(updateData)
			.set("Accept", "application/json");

		expect(response.status).toBe(200);
		expect(response.body.sale.accountNumber).toBe(2002);
		expect(response.body.sale.agreementLength).toBe(initialSaleData.agreementLength);

		const updatedSale = await Sale.findByPk(saleId);
		expect(updatedSale.accountNumber).toBe(2002);
	});

	it("should successfully update a sale with all fields", async () => {
		const updateData = {
			accountNumber: 2002,
			agreementLength: "12 Months",
			planType: "Pro",
			initialPrice: 100.0,
			monthlyPrice: 20.0,
			autopay: "CC",
			serviceDate: "02-15-2025",
			serviced: "Yes",
			notes: "Updated sale",
		};

		const response = await agent
			.put(`/api/sales/${saleId}`)
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(updateData)
			.set("Accept", "application/json");

		expect(response.status).toBe(200);
		expect(response.body.sale).toMatchObject({
			...updateData,
			serviceDate: "2025-02-15", // Expected Sequelize format in response
		});

		const updatedSale = await Sale.findByPk(saleId);
		expect(updatedSale.toJSON()).toMatchObject({
			...updateData,
			serviceDate: "2025-02-15", // Expected Sequelize format in DB
		});
	});

	it("should succeed with an empty request body", async () => {
		const response = await agent
			.put(`/api/sales/${saleId}`)
			.set("XSRF-TOKEN", agent.csrfToken)
			.send({})
			.set("Accept", "application/json");

		expect(response.status).toBe(200);
		expect(response.body.sale).toMatchObject(initialSaleData);
	});

	it("should fail with invalid accountNumber (negative)", async () => {
		const updateData = { accountNumber: -1 };

		const response = await agent
			.put(`/api/sales/${saleId}`)
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(updateData)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.errors.accountNumber).toBe("Account number must be an integer greater than or equal to 1");
		const sale = await Sale.findByPk(saleId);
		expect(sale.accountNumber).toBe(initialSaleData.accountNumber);
	});

	it("should fail with invalid agreementLength", async () => {
		const updateData = { agreementLength: "Invalid" };

		const response = await agent
			.put(`/api/sales/${saleId}`)
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(updateData)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.errors.agreementLength).toBe(
			"Agreement length must be 'One-time', '12 Months', or '24 Months'"
		);
	});

	it("should fail with invalid planType", async () => {
		const updateData = { planType: "Invalid" };

		const response = await agent
			.put(`/api/sales/${saleId}`)
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(updateData)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.errors.planType).toBe("Plan type must be 'One-time', 'Basic', 'Pro', or 'Premium'");
	});

	it("should fail with invalid initialPrice (negative)", async () => {
		const updateData = { initialPrice: -10.0 };

		const response = await agent
			.put(`/api/sales/${saleId}`)
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(updateData)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.errors.initialPrice).toBe("Initial price must be a number greater than or equal to 0");
	});

	it("should fail with invalid monthlyPrice (less than 1)", async () => {
		const updateData = { monthlyPrice: 0.5 };

		const response = await agent
			.put(`/api/sales/${saleId}`)
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(updateData)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.errors.monthlyPrice).toBe("Monthly price must be a number greater than 1");
	});

	it("should fail with invalid autopay", async () => {
		const updateData = { autopay: "Invalid" };

		const response = await agent
			.put(`/api/sales/${saleId}`)
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(updateData)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.errors.autopay).toBe("Autopay must be 'None', 'CC', or 'ACH'");
	});

	it("should fail with invalid serviceDate format", async () => {
		const updateData = { serviceDate: "2025-02-15" };

		const response = await agent
			.put(`/api/sales/${saleId}`)
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(updateData)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.errors.serviceDate).toBe("Service date must be a valid date in MM-DD-YYYY format");
	});

	it("should fail with invalid serviced value", async () => {
		const updateData = { serviced: "Invalid" };

		const response = await agent
			.put(`/api/sales/${saleId}`)
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(updateData)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.errors.serviced).toBe("Serviced must be 'Yes', 'No', or 'Pending'");
	});

	it("should fail with invalid notes type", async () => {
		const updateData = { notes: 123 };

		const response = await agent
			.put(`/api/sales/${saleId}`)
			.set("XSRF-TOKEN", agent.csrfToken)
			.send(updateData)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.errors.notes).toBe("Notes must be a string");
	});

	it("should return 404 for non-existent sale", async () => {
		const response = await agent
			.put("/api/sales/999")
			.set("XSRF-TOKEN", agent.csrfToken)
			.send({ accountNumber: 2002 })
			.set("Accept", "application/json");

		expect(response.status).toBe(404);
		expect(response.body.message).toBe("Sale not found");
	});

	it("should return 403 for sale owned by another user", async () => {
		// Log out and log in as other user
		await agent.post("/api/session").send({ email: otherUser.email, password: otherUser.password });

		const response = await agent
			.put(`/api/sales/${saleId}`)
			.set("XSRF-TOKEN", agent.csrfToken)
			.send({ accountNumber: 2002 })
			.set("Accept", "application/json");

		expect(response.status).toBe(403);
		expect(response.body.message).toBe("Forbidden - Only the user who created the sale can update this sale");
	});

	it("should return 401 for unauthenticated requests", async () => {
		const response = await request(app)
			.put(`/api/sales/${saleId}`)
			.send({ accountNumber: 2002 })
			.set("Accept", "application/json");

		expect(response.status).toBe(401);
		expect(response.body.message).toBe("Authentication required");
	});
});
