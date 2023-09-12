exports.postAddThing = (req, res, next) => {
    console.log(req.body);
    res.redirect('/add-thing');
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