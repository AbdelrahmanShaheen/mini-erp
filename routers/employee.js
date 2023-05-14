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

module.exports = router;
