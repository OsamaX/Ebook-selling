function Sort(res, db, sort = "", email, cb, leap = 0) {
    var sort = sort.toLowerCase();

    switch (sort) {
        case "my":
            db.find({ email: email, sold: "NO" }).sort({"_id": "-1"}).limit(12).skip(12 * leap).exec(function (err, books) {
                if (err) return err;

                sendRes(cb, books, sort, res, db, email);
            });
            break;

        case "sci-fic":
            db.find({ category: sort, sold: "NO" }).sort({"_id": "-1"}).limit(12).skip(12 * leap).exec(function (err, books) {
                if (err) return err;

                sendRes(cb, books, sort, res, db, email);
            });
            break;

        case "drama":
            db.find({ category: sort, sold: "NO"  }).sort({"_id": "-1"}).limit(12).skip(12 * leap).exec(function (err, books) {
                if (err) return err;

                sendRes(cb, books, sort, res, db, email);
            });
            break;

        case "act-adv":
            db.find({ category: sort, sold: "NO"  }).sort({"_id": "-1"}).limit(12).skip(12 * leap).exec(function (err, books) {
                if (err) return err;

                sendRes(cb, books, sort, res, db, email);
            });
            break;

        case "romance":
            db.find({ category: sort, sold: "NO"  }).sort({"_id": "-1"}).limit(12).skip(12 * leap).exec(function (err, books) {
                if (err) return err;

                sendRes(cb, books, sort, res, db, email);
            });
            break;

        case "horror":
            db.find({ category: sort, sold: "NO"  }).sort({"_id": "-1"}).limit(12).skip(12 * leap).exec(function (err, books) {
                if (err) return err;

                sendRes(cb, books, sort, res, db, email);
            });
            break;

        default:
            db.find({sold: "NO"}).sort({"_id": "-1"}).limit(12).skip(12 * leap).exec(function (err, books) {
                if (err) return err;
                
                sendRes(cb, books, sort, res, db, email);
            });
            break;
    }



}

function sendRes(cb, books, sort, res, db, email) {
    if (cb == undefined) {
        
        let toSearch = {}
        
        if (sort != "sci-fic" && sort != "act-adv" && sort != "drama" && sort != "romance" && sort != "horror" && sort != "my") {
            toSearch = {};
        } else if (sort == "my") {
            toSearch = {email}
        }
        else toSearch = {category: sort};

        db.count(toSearch, function(err, count) {
            if (err) next(err);
            
            books.push(count);
            books.push(email);
            return res.send(books);
        })

        
     }
    else cb(books);
}

module.exports = Sort;