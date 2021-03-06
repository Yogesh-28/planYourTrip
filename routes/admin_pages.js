var express = require('express');
var router = express.Router();

//get page model
var Page = require('../models/page');

//get page index
router.get('/', function(req,res) {
    Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
        res.render('admin/pages', {
            pages: pages
        });
    });
});

//get add page
router.get('/add-page', function(req,res) {
    var title = "";
    var slug = "";
    var content = "";

    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    });
});

//post add page
router.post('/add-page', function(req,res) {
    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('content', 'Content must have a value.').notEmpty();
    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    var errors = req.validationErrors();
    if (errors) {
        res.render('admin/add_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        });
    } else{
        Page.findOne({slug: slug}, function (err, page) {
            if (page) {
                req.flash('danger', 'Page slug exists, choose another.');
                res.render('admin/add_page', {
                    title: title,
                    slug: slug,
                    content: content
                });
            } else {
                var page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 0
                });

                page.save(function (err) {
                    if (err) return console.log(err);

                    req.flash('success', 'Page added!');
                    res.redirect('/admin/pages');
                });
            }
        });
    }
});

//get edit page
router.get('/edit-page/:slug', function(req,res) {
    Page.findOne({slug: req.params.slug}, function (err, page) {
        if (err) return console.log(err);

        res.render('admin/edit_page.ejs', {
            title: Page.title,
            slug: Page.slug,
            content: Page.content,
            id: Page._id
        });
    });
});

//post edit page
router.post('/edit-page/:slug', function (req, res) {

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('content', 'Content must have a value.').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/edit_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    } else {
        Page.findOne({slug: slug, function (err, page) {
            if (page) {
                req.flash('danger', 'Page slug exists, choose another.');
                res.render('admin/edit_page', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });
            } else {

                Page.findById(id, function (err, page) {
                    if (err)
                        return console.log(err);

                    page.title = title;
                    page.slug = slug;
                    page.content = content;

                    page.save(function (err) {
                        if (err)
                            return console.log(err);

                        Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.app.locals.pages = pages;
                            }
                        });


                        req.flash('success', 'Page edited!');
                        res.redirect('/admin/pages/edit-page/' + id);
                    });

                });


            }
        });
    }

});

//GET delete page
router.get('/delete-page/:slug', function (req, res) {
   Page.findByIdAndRemove(req.params.slug, function (err) {
       if (err)
           return console.log(err);

       Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
           if (err) {
               console.log(err);
           } else {
               req.app.locals.pages = pages;
           }
       });

       req.flash('success', 'Page deleted!');
       res.redirect('/admin/pages/');
   });
});


// Exports
module.exports = router;
