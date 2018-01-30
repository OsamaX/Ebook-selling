const express = require("express");
let router = express.Router();
let User = require("../models/user");
let Book = require("../models/books");
let Cart = require("../models/cart");
const middlewear = require("../middlewear");
const path = require("path");
const fs = require("fs");
const Books = require("../utilities/Books");
const imgValidate = require("../utilities/imgValidate");
const sort = require("../utilities/Sort");
const utility = require("../utilities/utility");
const paypal = require("paypal-rest-sdk");

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AUUJy_et9EY4GE5Dn2TS8icgdJxml9NY863mzy2mih8OiJkUquY168-iky1ioa63RmYHpXi8pjAtfWEt',
    'client_secret': 'EHncGNkbsXjtW-oInt85ewuiscwu0U5WKRhztYR91bNyBtJiVu18fkCRTdlKaWs-HiEyNSRQ6jMJinzE'
});

router.get("/", (req, res) => {
    res.render("index", { title: "BookWorm" });
});

router.get("/about", (req, res) => {
    res.render("about", { title: "About" });
});

router.get("/contact", (req, res) => {
    res.render("contact", { title: "Contact" });
});

router.get("/login", middlewear.loggedOut, (req, res) => {
    res.render("login", { title: "Log In" });
});

router.post("/login", (req, res, next) => {

    if (req.body.email && req.body.password) {
        User.authenticate(req.body.email, req.body.password, function (error, user) {
            if (error || !user) {
                return res.render("login", { error: "Wrong Email or Password" });
            } else {

                req.session.userId = user._id;
                req.session.email = user.email;
                req.session.name = user.name;
                return res.redirect("/profile");

            }
        });
    } else {
        return res.render("login", { error: "Email and Password are required" });
    }

});

router.get("/profile", middlewear.requireLogIn, (req, res, next) => {
    User.findById(req.session.userId, (error, user) => {
        if (error) return next(error);

        else {
            return res.render("profile", { title: "Profile", name: user.name, favorite: user.favoriteBook, userImg: user.profile_img, details: user.details })
        }

    })
});


router.get("/logout", function (req, res, next) {
    if (req.session) {
        req.session.destroy(function (err) {
            if (err) return next(err);

            else return res.redirect("/");
        })
    }
})

router.get("/register", middlewear.loggedOut, (req, res) => {
    return res.render("register");

});

router.post("/register", (req, res, next) => {
    if (req.body.name && req.body.email && req.body.favoriteBook && req.body.password && req.body.confirm_pass) {

        if (req.body.password !== req.body.confirm_pass) {
            return res.render("register", { error: "Password doesn't match" });
        }

        let { name, email, favoriteBook, password } = req.body;

        let userData = { name, email, favoriteBook, password, profile_img: "", details: null };

        User.create(userData, function (err, user) {
            if (err) {

                if (err.errmsg.includes("email_1")) {
                    res.render("register", { error: "Email Already in Use!" })
                } else {
                    next(err);
                }

            } else {
                req.session.userId = user._id;
                req.session.email = user.email;
                req.session.name = user.name;
                res.redirect("/profile");

            }


        });

    } else {
        res.render("register", { error: "All feilds are required" });
    }
});

router.post("/pic_upload", function (req, res, next) {
    imgValidate(req.files.imgUpload, "profileImg", next, res, (filePath) => {
        updatePic(req, res, filePath, next);
    });
    // let profileImg = req.files.imgUpload;
    // if (profileImg.mimetype != 'image/png' && profileImg.mimetype != 'image/jpeg') {
    //     return res.end("Invalid File Type");
    // }

    // let filePath = path.join(process.cwd(), 'uploads', 'profileImg', '/', new Date().getMilliseconds().toString()) + profileImg.name;


    // profileImg.mv(filePath, err => {
    //     if (err) return console.log(err);

    //     filePath = filePath.split("\\");
    //     filePath = filePath.splice(7);
    //     filePath = path.join(filePath[0], filePath[1]);

    //     updatePic(req, res, filePath, next);

    // });

});

router.post("/details", (req, res, next) => {
    let ok = true

    for (let i in req.body) {
        req.body[i] = req.body[i].trim();
        if (req.body[i].length == 0) {
            ok = false;
            break;
        }
    }

    if (ok) {

        User.update({ _id: req.session.userId }, { $set: { details: req.body } }, err => {
            if (err) next(err);

            return res.send(req.body);
        });

    } else {
        return res.send("Not Valid");
    }


});

router.get("/books", middlewear.requireLogIn, (req, res, next) => {
    res.locals.book_nav = true;

    let currentEmail = req.session.email;
    let q = req.query.q;

    let toSearch = {}

    if (q != "sci-fic" && q != "act-adv" && q != "drama" && q != "romance" && q != "horror" && q != "my") {
        toSearch = {sold: "NO"};
    } else if (q == "my") toSearch = {email: currentEmail, sold: "NO"}
    else toSearch = {category: q, sold: "NO"};

    Book.count(toSearch, function(err, count) {
        if (err) next(err);

        sort(res, Book, q, currentEmail, function (books) {
            return res.render("books", { books, currentEmail, count, q });
        });
    })

   

});

router.post("/add_book", (req, res, next) => {
    User.findById(req.session.userId, (err, user) => {
        if (user.details) {
            let book = new Books(req.body);
            book.save(Book, req, res, next);
        } else {
            return res.send("prof-empt");
        }
    })
    

});

router.delete("/delete_book", (req, res, next) => {
    let q = utility.getQuery(req.headers.referer);
    let pageNum = req.body.pageNum;

    if (pageNum > 0 ) {
        pageNum = pageNum - 1;
    }


    Book.findById(req.body.id, function (err, book) {
        if (err) next(err);

        if (book.email == req.session.email) {

            Book.findByIdAndRemove(req.body.id, function (err, doc) {
                if (err) next(err);

                let imgPath = path.join(process.cwd(), "uploads", doc.image);

                fs.stat(imgPath, (err, stat) => {
                    if (!err) {
                    
                        fs.unlinkSync(imgPath);
                    }
                });
                return sort(res, Book, q, req.session.email, undefined, pageNum);
            });
        } else {
            return next("Not Authorized");
        }

    });

});

router.get("/page", (req, res, next) => {
    let {pageNum} = req.query;
    let q = utility.getQuery(req.headers.referer);

    pageNum = pageNum -1; 

    return sort(res, Book, q, req.session.email, undefined, pageNum);

});

router.delete("/delete_cart", (req, res, next) => {
    let id = req.body.id;

    Cart.findByIdAndRemove(id, function(err, item) {
        if (err) next(err);

        Book.findByIdAndRemove(item.book, function(err, book) {
            if (err) next(err);

            let imgPath = path.join(process.cwd(), "uploads", book.image);
            
            fs.stat(imgPath, (err, stat) => {
                if (!err) {
                
                    fs.unlinkSync(imgPath);
                }
            });
            return res.send("/cart");
        })
        
    })

});

router.get("/book_details", (req, res, next) => {
    let details = [];

    let id = req.query.id;

    Book.findById(req.query.id, function(err, book) {
        if (err) next(err);
        console.log(book);
        details.push(book);

        User.findOne({email: book.email}, function(err, user) {
            if (err) next(err);

            details.push(user.details);
            return res.send(details);
        })
    });

});

let price;

router.post("/buy", (req, res, next) => {
    Book.findById(req.body.id, (err, book) => {
        if (err) next(err);

        if (book.sold == "YES") return res.send("Book already sold");

        let name = book.title;
        let sku = book._id;
        let seller_email = book.email;
        price = book.price;

        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:8080/success",
                "cancel_url": "http://localhost:8080/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": name,
                        "sku": sku,
                        "price": price,
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": price
                },
                "description": seller_email
            }]
        };
    
        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                console.log(error)
                return next(error);
                
            } else {
                console.log(payment.links[1].href);
                res.send(payment.links[1].href);
            }
        });

});
    

    
});

router.get("/success", (req, res, next) => {

    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": price
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            return next(error.message);
        } else {

            Book.findByIdAndUpdate(payment.transactions[0].item_list.items[0].sku, { $set: { sold: "YES" } }, (err, book) => {
                if (err) next(err);
                console.log(book);

                let details = payment.payer.payer_info.shipping_address;
                details.price = payment.transactions[0].amount.total;
                details.title = book.title;
                details.email = req.session.email;
                details.seller_email = payment.transactions[0].description;
                details.book = payment.transactions[0].item_list.items[0].sku;
                details.img = book.image;

                Cart.create(details, (err, cart) => {
                    if (err) next(err);

                   return res.redirect("/cart");
                });
            })

        }
    });
});

router.get("/cancel", (req, res) => {
    res.send("Cancelled");
});

router.get("/cart", (req, res, next) => {
    Cart.find({email: req.session.email}, (err, items) => {
        if (err) return next(err);

        return res.render("cart", {items});
    });
});


//Utilities
function updatePic(req, res, newPath, next) {

    User.findById(req.session.userId, function (err, user) {

        if (err) return next(err);
        let oldPath = user.profile_img;
        if (oldPath !== "") oldPath = path.join("uploads", oldPath);

        user.profile_img = newPath;

        user.save(function (err, updatedUser) {
            if (err) return next(err);
            if (oldPath != "") {

                fs.stat(oldPath, function (err, stat) {

                    if (!err) {
                        fs.unlinkSync(oldPath);

                    }
                });

            }
            return res.end(newPath);
        });
    });

}

router.get("/test", (req, res, next) => {
    return res.status(401).send("<h1>Unauthorized Access</h1>");
});

router.all('*', (req, res) => {
    res.status(404).render("error", {error: "File not Found", status: res.statusCode});
  })

module.exports = router;