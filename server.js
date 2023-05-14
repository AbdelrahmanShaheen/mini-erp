const dotenv = require("dotenv");
const app = require("./app");

dotenv.config({ path: "./.env" });
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
