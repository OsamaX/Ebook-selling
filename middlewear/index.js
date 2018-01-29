function loggedOut(req, res, next) {
    if (req.session && req.session.userId) {
        return res.redirect('/profile');
    } else {
        return next();
    }
}

function requireLogIn(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.render("login", {error: "You are not logged in"})
    }
}

module.exports.loggedOut = loggedOut;
module.exports.requireLogIn = requireLogIn;