const path = require("path");

module.exports = function imgValidate(profileImg, loc, next, res, cb) {

    if (profileImg) {
        if (profileImg.mimetype != 'image/png' && profileImg.mimetype != 'image/jpeg') {
            return res.send("Invalid Image Type");
        } else {

            let filePath = path.join(process.cwd(), 'uploads', loc, '/', new Date().getMilliseconds().toString()) + profileImg.name;

            profileImg.mv(filePath, err => {   
                if (err) console.log(err);

                filePath = filePath.split("\\");
                filePath = filePath.splice(7);
                filePath = path.join(filePath[0], filePath[1]);

                cb(filePath);
            });
        }

} else {
    return res.send("Select an image");
}

}