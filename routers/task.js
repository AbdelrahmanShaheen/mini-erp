const prisma = require("../prisma/prisma");
const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const router = new express.Router();
//Create task endpoint
router.post("/tasks", auth, async (req, res) => {
  try {
    // Check if the authenticated user has the privilege to create tasks
    if (req.employee.role !== "SUPER_ADMIN" && req.employee.role !== "HR") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { name, deadline, employeeId, salary } = req.body;

    const task = await prisma.task.create({
      data: {
        name,
        deadline: new Date(deadline),
        employee: { connect: { id: employeeId } },
        salary,
      },
    });

    return res.json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//Read all tasks endpoint
router.get("/tasks", auth, async (req, res) => {
  const employeeId = req.employee.id;
  try {
    const tasks = await prisma.task.findMany({
      where: { employeeId: employeeId },
    });
    return res.json(tasks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
