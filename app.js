const express = require('express'), mongoose = require("mongoose"), bodyParser = require("body-parser"), session =  require("express-session"), MongoStore = require("connect-mongo")(session), fileUpload = require('express-fileupload');


let app = express();

app.set("view engine", "pug");
app.set('port', process.env.PORT || 8080);
app.use("/static", express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/uploads"));
app.use(express.static(__dirname + "/node_modules"));

mongoose.connect("mongodb://bookworm123:assassin123@ds117148.mlab.com:17148/bookworm");

let db = mongoose.connection;

db.on("error", function (err) {  
    console.log('Mongoose default connection error: ' + err);
}); 


app.use(session({
    secret: 'mama chacha',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}));

app.use(fileUpload());


app.use(function(req, res, next) {
    res.locals.currentUser = req.session.userId;
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))


const router = require("./routes");

app.use("/", router);


app.use((err, req, res, next) => {
    if (app.get("env") == "development") {
        res.status(err.status || 500);
        res.render("error", {error: err.message, status: err.status})
    }
    next();
});


app.listen(app.get('port'), () => {
    console.log("App is running at port 8080");
});

console.log(app.get("view engine"));
