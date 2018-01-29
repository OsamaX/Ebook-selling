const imgValidate = require("./imgValidate");
const sort = require("./Sort");
const utility = require("./utility.js");

class Books {
    constructor(details) {
       this.bookDetails = details
    }

    save(db, req, res, next) {
        let book = req.body;
        
        let ok = true
        
        for (let i in book) {
            book[i] = book[i].trim();
            if (book[i].length == 0) {
                ok = false;
                break;
            }
        }

        let q = utility.getQuery(req.headers.referer);
        
        imgValidate(req.files.image, "booksImg", next, res, function(filePath) {
            if (ok) {
                book.image = filePath;
                book.posted_by = req.session.name;
                book.email = req.session.email;
                book.sold = "NO";
                db.create(book, function (err, books) {
                    if (err) next(err);
                    
                    sort(res, db, q, req.session.email);
                });
            } else {
                return res.send("Not Valid");
            }
        });

    }

    delete(db) {
        db.remove({_id: req.session.email}, function(err) {
            if (err) next(err);

            return res.send("Deleted");
        });
    }
}

module.exports = Books;