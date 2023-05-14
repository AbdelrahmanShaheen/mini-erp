require("./superAdminSetup");
const express = require("express");
const app = express();
const taskRouter = require("./routers/task");
const employeeRouter = require("./routers/employee");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});
app.use(express.json());
app.use(taskRouter);
app.use(employeeRouter);

module.exports = app;
