const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 8002;

const handleDatabaseConnection = require("./src/config");
const authRoute = require("./src/routes/auth.routes");
const userRoute = require("./src/routes/user.routes");

app.use(cors());
app.use(express.json());

handleDatabaseConnection(process.env.MONGO_URI)
  .then(() => {
    console.log(`meet connected to database`);
  })
  .catch((err) => {
    console.log("failed to connect to database", err);
  });

app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);

app.listen(port, () => {
  console.log(`meet started on port ${port}`);
});
