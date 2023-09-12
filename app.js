const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const mirrorRoutes = require('./routes/mirror');


app.set("view engine", "ejs");
app.set("views", "views"); //it's the default

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(mirrorRoutes);



app.get('/add-thing', (req, res, next) => {
    res.render('edit-thing');
});

app.listen(3000);