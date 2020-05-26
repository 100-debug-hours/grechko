"use strict"
let bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const crypto = require('crypto');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const storage = require("./public/javascripts/storage.js");
let express = require('express');
let app = express();

app.use(session({
    secret: 'H5110.K1Tt/',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


let multer  = require('multer');
let storageMulter = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/posters/')
    }
  });
let upload = multer({ storage: storageMulter });

app.use(cookieParser());
app.use(bodyParser.json()); 
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res, next) {
    res.render('main', {user: req.user});
});
app.get('/logout', loggedIn, function(req, res, next) {
    req.logout();
    res.redirect('/');
});

app.get("/notarius", loggedIn, function(req, res, next) {
    let notarius = storage.getAll()
    .then (data =>{
        data.user = req.user;
        res.render('searchNotarius', data);
    })
    .catch(err => console.log(err.toString()));
})

app.get('/addNotarius', loggedIn, function(req, res, next) {
    res.render('addNotarius', {user: req.user});
});

app.post('/addNotarius', loggedIn, function(req, res, next) {
    storage.addNotarius(req)
    .then(data => {
        res.redirect("/notarius");
    });
});

app.post('/delNotarius', (req, res) => {
    let notariusId = req.body.id;
    console.log("REQ.Body: ", req.body);
    storage.delNotarius(notariusId)
    .then(id => {
        res.redirect("/notarius");
    });
});

app.post('/editNotarius', (req, res) => {
    let notariusId = req.body.id;
    res.redirect("/notarius/" + notariusId);
});

app.post('/updateNotarius', loggedIn, function(req, res, next) {
    console.log("INDEX: " + req.body.index)
    storage.editNotarius(req)
    .then(data => {
        res.redirect("/notarius");
    });
});

app.get("/notarius/:id", loggedIn, function(req, res, next) {
    let notarius = storage.getById(req.params.id)
    .then (data =>{
        data.user = req.user;
        res.render('editNotarius', data);
    })
    .catch(err => console.log(err.toString()));
})

app.get('/', function(req, res, next) {
    res.render('main', {user: req.user});
});

app.get('/register',
(req, res) => res.render('register', {
    user: req.user
}));

let storageAvatars = multer.diskStorage({
destination: function (req, file, cb) {
    cb(null, 'public/images/avatars/')
}
});
let uploadAva = multer({ storage: storageAvatars});

let avatar = uploadAva.fields([{ name: 'avatar', maxCount: 1 }]);
app.post('/register', avatar,
(req, res) => {
    console.log(typeof(req.files));
    let user = {
        username: req.body.username,
        passwordHash: sha512(req.body.password, serverSalt).passwordHash,
        isAdmin: req.body.username === 'admin' ? 'true' : 'false'
    };
    if (!isEmpty(req.files)){
        user.avatar = req.files['avatar'][0].originalname;
        user.id = req.files['avatar'][0].filename;
        user.filename = req.files['avatar'][0].originalname;
    }
    else{
        user.avatar = "../images/avatars/default.jpg";
        user.id = "default.jpg";
        user.filename = "default.jpg";
    }
    storage.createUser(user)
        .then(() => {
            res.redirect('/notarius');
        })
        .catch((err) => {
            console.log(err);
            if (err === "logintaken")
                res.render('logintaken');
            else if (err === "is not in db")
                res.redirect('/notarius');           
        });
});

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

app.get('/login',
(req, res) => res.render('login', {
    user: req.user
}));
app.get('/wrongdata', (req, res) => res.render('wrongdata'));

app.get('/logout', loggedIn, function(req, res, next) {
    req.logout();
    res.redirect('/');
});

app.post('/login', 
passport.authenticate('local', {
    successRedirect: '/notarius',
    failureRedirect: '/wrongdata'
}));

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

const serverSalt = "1'm6o1nG_84Ck.T0505";

function sha512(password, salt) {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    const value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
};

passport.use(new LocalStrategy(
    function (username, password, done) {
        let hash = sha512(password, serverSalt).passwordHash;
        storage.getUserByLoginAndPasshash(username, hash)
            .then(user => {
                done(user ? null : 'No user', user);
            });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (_id, done) {
    storage.getUserById(_id)
        .then(data => {
            done(data ? null : 'No user', data);
        })
        .catch();
}); 

function checkAdmin(req, res, next) {
    if (req.user.isAdmin != true) return res.sendStatus(403);
    next();
}

let port = 8080;
app.listen(process.env.PORT || port, () => console.log('port', port));
module.exports = app; 