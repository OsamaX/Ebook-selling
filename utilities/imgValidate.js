const path = require("path");

module.exports = function imgValidate(profileImg, loc, next, res, cb) {

    if (profileImg) {
        if (profileImg.mimetype != 'image/png' && profileImg.mimetype != 'image/jpeg') {
            return res.send("Invalid Image Type");
        } else {

            let filePath = path.join(process.cwd(), 'uploads', loc, '/', new Date().getMilliseconds().toString()) + profileImg.name;

            profileImg.mv(filePath, err => {   
                if (err) console.log(err);
                // console.log(filePath)
                filePath = filePath.split("\\");
                let i = filePath.indexOf("uploads")
                filePath = filePath.splice(i);
                filePath = path.join(filePath[1], filePath[2]);

                cb(filePath);
            });
        }

} else {
    return res.send("Select an image");
}

}
