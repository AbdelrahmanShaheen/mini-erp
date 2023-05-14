require("./superAdminSetup");
const express = require("express");
const app = express();
const taskRouter = require("./routers/task");
const employeeRouter = require("./routers/employee");
const salaryHistoryRouter = require("./routers/salary_history");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});
app.use(express.json());
app.use(taskRouter);
app.use(employeeRouter);
app.use(salaryHistoryRouter);
module.exports = app;
