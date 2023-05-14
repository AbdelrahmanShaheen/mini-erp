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

//Update task status endpoint
router.patch("/tasks/:taskId", auth, async (req, res) => {
  const taskId = parseInt(req.params.taskId);
  const update = Object.keys(req.body);
  //if the update is not status, return error
  if (update.length !== 1 || !update.includes("status")) {
    return res.status(400).json({ error: "Invalid updates" });
  }
  const { status } = req.body;
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { employee: true },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: status },
    });

    return res.json(updatedTask);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
