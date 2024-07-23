const express = require("express");
const app = express();
const port = process.env.PORT || 8001;

app.get("/", (req, res) => {
 return res.send("Hello World");
})

app.listen(port, () => {
 console.log(`meet started on port ${port}`);
})