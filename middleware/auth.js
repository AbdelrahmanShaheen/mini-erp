const jwt = require("jsonwebtoken");
const prisma = require("../prisma/prisma");
// Authentication middleware
async function auth(req, res, next) {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    if (token === null) throw new Error();
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const id = decodedToken.id;
    const employee = await prisma.employee.findUnique({
      where: { id: id },
      include: { tasks: true, salaryHistories: true },
    });
    if (!employee) throw new Error();
    console.log(employee);
    req.employee = employee;
    next();
  } catch (error) {
    return res.sendStatus(401);
  }
}

module.exports = auth;
