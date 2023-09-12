const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const mirrorRoutes = require('./routes/mirror');
const _404Controller = require('./controller/404');


app.set("view engine", "ejs");
app.set("views", "views"); //it's the default

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(mirrorRoutes);




app.get('/', (req, res, next) => {
    res.redirect('/add-thing');
})

app.use(_404Controller.get404);

app.listen(3000);