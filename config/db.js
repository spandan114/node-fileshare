require("dotenv").config();
const mongoose = require("mongoose");

function connectDB() {
  const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
  };

  mongoose.connect(process.env.MONGO_URI, options);
  
  mongoose.connection.on("connected", function () {
    console.log("MongoDB  connected");
  });

  mongoose.connection.on("disconnected", function () {
    console.log("MongoDB disconnected");
  });

  mongoose.connection.on("reconnected", function () {
    console.log("MongoDB reconnected");
  });

  mongoose.connection.on("error", function (err) {
    console.log("MongoDB error: " + err);
  });
}

module.exports = connectDB;
