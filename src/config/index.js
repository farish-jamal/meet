const mongoose = require("mongoose");

exports.handleDatabaseConnection = async(url) => {
 return mongoose.connect(url);
}