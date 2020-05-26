import { UserRole } from "../public/javascripts/db/entities/user.entity";
import { Router } from "express";
import { User } from "../public/javascripts/db/entities/user.entity";
import * as crypto from 'crypto';
import passport from "passport";
import Container from "typedi";
import { DbService } from "../public/javascripts/db/db.service";

// тут был Аркадий
// Аркаша это любовь!

export const serverSalt = "1'grechko postav ashku ili eshku";
const db = Container.get(DbService);

export function sha512(password: string, salt) {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    const value = hash.digest('hex');
    return { salt, passwordHash: value };
};


export const router = Router()
    .get('/logout', verify(), (req, res, next) => {
        req.logout();
        res.redirect('/');
    })
    .get('/register', (req, res) => res.render('register', { user: req.user}))
    .post('/register', async (req: any, res) => {
        console.log(req.body);
        console.table(req.body);

        const password = req.body.password;
        delete req.body.password;

        const user: User = {...req.body};
        user.password_hash =  sha512(password, serverSalt).passwordHash;
        user.type = UserRole.Admin;

        try {
            await db.createUser(user);
            res.redirect('/formation');
        } catch(err) {
            console.error({ suka: err });
            res.render('logintaken');
        }
    })
    .get('/login', (req, res) => res.render('login', { user: req.user }))
    .post('/login', (req, res, next) => {
        console.log(req.body);
        next();
    }, passport.authenticate('local', {
        successRedirect: '/formation',
        failureRedirect: '/login'
    }));



export function verify(roles?: UserRole[]) {
    return (req, res, next) => {
        console.log("Verifying", req.user);
        if (!req.user) return res.redirect('/login');
        if (req.user.disabled) return res.redirect('/login');
        if (!roles) return next();
        if (roles.includes(req.user.type)) return next();
        return res.redirect('/login');
    };
}

export const adminOrRegistrator = [UserRole.Admin, UserRole.Registrator];
