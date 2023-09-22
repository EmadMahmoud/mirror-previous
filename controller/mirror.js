const User = require('../models/user');
const Thing = require('../models/thing');
const mongoose = require('mongoose');

exports.postAddThing = (req, res, next) => {
    const category = req.body.category;
    const name = req.body.name;
    const comment = req.body.comment.trim();

    const thing = new Thing({
        category: category,
        name: name,
        comment: comment,
        userId: req.user
    });
    thing.save()
        .then(result => {
            User.findById(req.user)
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
        path: '/add-thing',
        editing: false,
        thing: { category: 'movies' }
    });
};

exports.getThings = (req, res, next) => {
    req.user
        .populate('profile.things.thingId')
        .then(user => {
            const things = user.profile.things;
            const categories = ['movies', 'tv-shows', 'books', 'songs'];
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
                pageTitle: fetchedthing.name,
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

exports.getEditThing = (req, res, next) => {
    const thingId = req.params.thingId;
    Thing.findById(thingId)
        .then(thing => {
            res.render('edit-thing', {
                pageTitle: 'Edit Thing',
                path: '/edit-thing',
                editing: true,
                thing: thing
            });
        })
        .catch(err => console.log(`Error get thing to edit: ${err}`))
}

exports.postEditThing = (req, res, next) => {
    const thingId = req.params.thingId;
    const updatedCategory = req.body.category;
    const updatedName = req.body.name;
    const updatedComment = req.body.comment.trim();

    Thing.findById(thingId)
        .then(thing => {
            thing.category = updatedCategory;
            thing.name = updatedName;
            thing.comment = updatedComment;
            return thing.save()
        })
        .then(result => {
            console.log('Thing Updated Successfully!');
            res.redirect('/profile');
        })
        .catch(err => console.log(`Error updating thing: ${err}`))
}