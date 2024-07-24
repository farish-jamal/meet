const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 8001;

const {handleDatabaseConnection} = require("./src/config");

app.use(cors());
app.use(express.json());

handleDatabaseConnection(process.env.MONGO_URI).then(() => {
 console.log(`meet connected to database`);
}).catch((err) => {
 console.log('failed to connect to database', err);
})


app.listen(port, () => {
 console.log(`meet started on port ${port}`);
})