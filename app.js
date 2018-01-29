const express = require('express'), mongoose = require("mongoose"), bodyParser = require("body-parser"), session =  require("express-session"), MongoStore = require("connect-mongo")(session), fileUpload = require('express-fileupload');


let app = express();

app.set("view engine", "pug");
app.set('port', process.env.PORT || 8080);
app.set('env', process.env.NODE_ENV || "development");
app.use("/static", express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/uploads"));

mongoose.Promise = global.Promise

mongoose.connect("mongodb://bookworm123:assassin123@ds117148.mlab.com:17148/bookworm", (err) => {
    if (err) return console.log(err);
    
    console.log("Connection to DB Created");
});

let db = mongoose.connection;

app.use(session({
    secret: 'ma ma cha cha',
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
    } else {
        res.status(500);
        res.render("error", {})
    }   
});


app.listen(app.get('port'), () => {
    console.log("App is running at port 8080");
});

console.log(app.get("view engine"));
