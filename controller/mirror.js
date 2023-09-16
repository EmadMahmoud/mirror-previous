const User = require('../models/user');
const Thing = require('../models/thing');
const mongoose = require('mongoose');

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
            User.findById('6500c0cbfe52711b39ac4d66')
                .then(user => {
                    user.profile.things.push({ thingId: thing._id })
                    user.save()
                    console.log(`Thing Created Successfully!`);
                    res.redirect('/profile');
                })


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


    req.user
        .populate('profile.things.thingId')
        .then(user => {
            const things = user.profile.things;
            const categories = ['movies', 'tv-shows', 'books', 'songs'];
            console.log(things)
            res.render('profile', {
                pageTitle: 'profile',
                path: '/profile',
                things: things,
                categories: categories
            });
        })
        .catch(err => console.log(err));
};


exports.getThingDetails = (req, res, next) => {
    const thingId = req.params.thingId;
    Thing.findById(thingId)
        .then(fetchedthing => {
            res.render('thing-details', {
                pageTitle: 'Thing Details',
                path: '/thing-details',
                thing: fetchedthing
            });
        })
        .catch(err => console.log(`Error get thing details: ${err}`));
}

exports.postDeleteThing = (req, res, next) => {
    const thingId = req.params.thingId;

    req.user
        .deleteAThing(thingId)
        .then(result => {
            Thing.findByIdAndDelete(thingId)
                .then(result => {
                    console.log('Thing Deleted Successfully!');
                    res.redirect('/profile');
                })
                .catch(err => `Error deleting thing ${err}`);
        })
}

