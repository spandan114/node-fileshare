const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
//db connect
const connectDB = require('./config/db')
connectDB()

//set static folder
app.use(express.static(path.join(__dirname,'public')))
// set view template
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
//routes
app.get("/", (req, res) => {
    return res.render('index')
});
app.use('/api/files',require('./routes/files.router'));
app.use('/files', require('./routes/showfile.router'));

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on port port ${port}`));