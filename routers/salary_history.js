const prisma = require("../prisma/prisma");
const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const router = new express.Router();

//Create salary history endpoint for an employee
router.post("/employees/:employeeId/salary-history", auth, async (req, res) => {
  const employeeId = parseInt(req.params.employeeId);
  const { month, year, salaryTaken } = req.body;

  try {
    // Check if the authenticated user has the privilege to create salary history
    if (req.employee.role !== "SUPER_ADMIN" && req.employee.role !== "HR") {
      return res.status(403).json({ error: "Access denied" });
    }

    const salaryHistory = await prisma.salaryHistory.create({
      data: {
        employeeId: employeeId,
        month: month,
        year: year,
        salaryTaken: salaryTaken,
      },
    });

    return res.json(salaryHistory);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
