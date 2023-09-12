exports.addThing = (req, res, next) => {
    console.log(req.body);
    res.redirect('/add-thing');
};