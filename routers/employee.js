const prisma = require("../prisma/prisma");
const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const router = new express.Router();

// Login endpoint
router.post("/login", async (req, res) => {
  const { name, password } = req.body;

  try {
    const employee = await prisma.employee.findFirst({
      where: { name: name },
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const passwordMatch = await bcrypt.compare(password, employee.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: employee.id, role: employee.role },
      process.env.JWT_SECRET
    );
    return res.json({ token, employee });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//Read profile endpoint
router.get("/profile", auth, async (req, res) => {
  try {
    return res.json(req.employee);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//Create new employee endpoint
router.post("/employees", auth, async (req, res) => {
  const { name, password, role, birthDate } = req.body;

  try {
    // Check if the authenticated user has the privilege to create a new employee
    if (req.employee.role !== "SUPER_ADMIN" && req.employee.role !== "HR") {
      return res.status(403).json({ error: "Access denied" });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await prisma.employee.create({
      data: {
        name: name,
        password: hashedPassword,
        role: role,
        birthDate: new Date(birthDate),
      },
    });

    return res.json(employee);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//Update employee profile endpoint
router.patch("/employees/:employeeId", auth, async (req, res) => {
  // Check if the authenticated user has the privilege to update employee profiles
  if (req.employee.role !== "SUPER_ADMIN" && req.employee.role !== "HR") {
    return res.status(403).json({ error: "Access denied" });
  }

  const employeeId = parseInt(req.params.employeeId);
  //handle error when updating by field that does not exist in the user.
  const allowedUpdates = ["name", "birthDate", "password"];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation)
    return res.status(400).send({ error: "invalid updates!" });

  try {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });
    updates.forEach((update) => {
      employee[update] = req.body[update];
    });
    //if updates include password, hash it before storing it
    if (updates.includes("password")) {
      employee.password = await bcrypt.hash(employee.password, 10);
    }
    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        name: employee.name,
        password: employee.password,
        birthDate: new Date(employee.birthDate),
      },
    });
    return res.json(updatedEmployee);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//Delete employee endpoint
router.delete("/employees/:employeeId", auth, async (req, res) => {
  const employeeId = parseInt(req.params.employeeId);

  try {
    // Check if the authenticated user has the privilege to delete employees
    if (req.employee.role !== "SUPER_ADMIN" && req.employee.role !== "HR") {
      return res.status(403).json({ error: "Access denied" });
    }
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { tasks: true, salaryHistories: true },
    });
    //if employee does not exist, return 404
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    await prisma.employee.delete({
      where: { id: employeeId },
    });

    return res.sendStatus(204);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//Get all employees endpoint
router.get("/employees", auth, async (req, res) => {
  try {
    // Check if the authenticated user has the privilege to view all employees
    if (req.employee.role !== "SUPER_ADMIN" && req.employee.role !== "HR") {
      return res.status(403).json({ error: "Access denied" });
    }

    const employees = await prisma.employee.findMany();

    return res.json(employees);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//Get employee details endpoint - by id
router.get("/employees/:employeeId", auth, async (req, res) => {
  const authenticatedEmployeeId = req.employee.id;
  const requestedEmployeeId = parseInt(req.params.employeeId);

  try {
    // Check if the authenticated user has the privilege to access employee details
    if (req.employee.role !== "SUPER_ADMIN" && req.employee.role !== "HR") {
      return res.status(403).json({ error: "Access denied" });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: requestedEmployeeId },
      include: { tasks: true, salaryHistories: true },
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    return res.json(employee);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
