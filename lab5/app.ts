import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import express from 'express';
import Container from 'typedi';
import { DbService } from "./public/javascripts/db/db.service";
import { User, UserRole } from './public/javascripts/db/entities/user.entity';

import { router as formationsRouter } from "./routes/formations";
import { router as authRouter, sha512, serverSalt } from './routes/auth';
import { router as userRouter } from './routes/users';

const app = express();
const db = Container.get(DbService);

const adminOrRegistrator = [UserRole.Admin, UserRole.Registrator];


app.use(session({
    secret: 'H5110.K1Tt/',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

let multer = require('multer');

app.use(cookieParser());
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('express-form-data').parse());

let logs = '';

const write = process.stdout.write;

process.stdout.write = (...args: any) => {
    logs += String(args[0]).replace(
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        ''
    ) + '<br>';
    return write.apply(process.stdout, args);
};

app.get('/logs', (req, res, next) => {
    res.send(logs);
});


app.get('/', (req, res, next) => res.redirect('/formation'));

app.get('/wrongdata', (req, res) => res.render('wrongdata'));

app.use(authRouter);
app.use(formationsRouter);
app.use(userRouter);

passport.use(new LocalStrategy(async (username, password, done) => {
    const hash = sha512(password, serverSalt).passwordHash;
    const user = await db.getUserByEmailAndPassword(username, hash);
    done(user ? null : 'No user', user);
}));

passport.serializeUser((user: User, done) => done(null, user.id));
passport.deserializeUser((id: string, done) => {
    db.getUserById(id)
        .then(data => done(data ? null : 'No user', data))
        .catch(console.error);
});


let PORT = 3000;

app.use("*", (err, req, res, next) => {
    res.render('error', { err: String(err)});
})

db.connect().then(
    () => {
        app.listen(process.env.PORT || PORT, () => console.log(
            `🐈🐈 Site is available at http://127.1.1.1:${PORT} 🐈🐈`
        ))
    },
    err => {
        console.error(`Bootstrap error:`, err);
        app.listen(process.env.PORT || PORT, () => console.log(
            `🐈🐈 Site is available at http://127.1.1.1:${PORT} 🐈🐈`
        ))
    }
);
