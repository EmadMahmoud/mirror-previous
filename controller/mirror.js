const User = require('../models/user');
const Thing = require('../models/thing');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

exports.postAddThing = (req, res, next) => {
    const category = req.body.category;
    const name = req.body.name;
    const comment = req.body.comment.trim();
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('edit-thing', {
            pageTitle: 'Add Thing',
            path: '/add-thing',
            editing: false,
            thing: { category: category, name: name, comment: comment },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

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
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
};

exports.getAddThing = (req, res, next) => {

    res.render('edit-thing', {
        pageTitle: 'Add Thing',
        path: '/add-thing',
        editing: false,
        thing: { category: 'movies' },
        errorMessage: [],
        validationErrors: []
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
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
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
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
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
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                })
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
                thing: thing,
                errorMessage: [],
                validationErrors: []
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}

exports.postEditThing = (req, res, next) => {
    const thingId = req.params.thingId;
    const updatedCategory = req.body.category;
    const updatedName = req.body.name;
    const updatedComment = req.body.comment.trim();
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('edit-thing', {
            pageTitle: 'Edit Thing',
            path: '/edit-thing',
            editing: true,
            thing: { _id: thingId, category: updatedCategory, name: updatedName, comment: updatedComment },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

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
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}