const User = require('../models/user');
const Thing = require('../models/thing');

exports.postAddThing = (req, res, next) => {
    const category = req.body.category;
    const name = req.body.name;
    const comment = req.body.comment;

    const thing = new Thing({
        category: category,
        name: name,
        comment: comment,
        userId: req.user
    });
    thing.save()
        .then(result => {
            console.log(`Thing Created Successfully!`);
            res.redirect('/add-thing');
        })
        .catch(err => console.log(`Error add thing: ${err}`));
};

exports.getAddThing = (req, res, next) => {

    res.render('edit-thing', {
        pageTitle: 'Add Thing',
        path: '/add-thing'
    });
};

exports.getThings = (req, res, next) => {
    res.render('profile', {
        pageTitle: 'Profile',
        path: '/profile'
    });
};