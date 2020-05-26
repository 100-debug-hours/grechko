import {Router} from "express"
import Container from "typedi";
import { DbService } from "../public/javascripts/db/db.service";
import { UserRole, User } from "../public/javascripts/db/entities/user.entity";
import { verify, sha512, serverSalt } from "./auth";
import { UpdateDateColumn } from "typeorm";

export const router = Router();
const db = Container.get(DbService);

router.get("/users", verify([UserRole.Admin]), async (req, res, next) => {
    const users = await db.getAllUsers('');
    users.forEach((user) => {
        user.type = user.type === UserRole.Admin
            ? "Адмін" as any
            : "Реєстратор" as any;

        user.disabled = user.disabled
            ? "Так" as any
            : "Ні" as any;
    })

    console.log(users);
    res.render('users', {
        users,
        user: req.user,
    });
});
// router.get("/users:id", verify([UserRole.Admin]), async (req, res, next) => {
//     const user = await db.getUserById(req.params.id);
//     if (!user) {
//         return res.render("notfound");
//     }

//     res.render('user', user)
// });

router.get('/user/:id', verify([UserRole.Admin, UserRole.Registrator]), async (req, res, lol) => {
    const registrator = await db.getUserById(req.params.id);
    if (!registrator) {
        return res.render("notfound");
    }

    const user = req.user;
    res.render('user', { user, registrator });
});

router.get('/registerRegistrator', verify([UserRole.Admin]), async (req, res, next) => {
    res.render('registerRegistrator');
});

router.post('/editRegistrator/:id', verify([UserRole.Admin]), async (req, res, next) => {
    console.log(req.body);
    console.table(req.body);

    const upd = {...req.body, id: req.params.id };

    if (upd.disabled === "on") {
        upd.disabled = true;
    } else {
        upd.disabled = false;
    }

    try {
        await db.updateUser(upd);
        res.redirect('/users');
    } catch(err) {
        console.error({ suka: err });
        res.render('logintaken');
    }
});

router.post('/registerRegistrator', verify([UserRole.Admin]), async (req, res, bext) => {
    console.log(req.body);
    console.table(req.body);

    const password = req.body.password;
    delete req.body.password;

    const user: User = {...req.body};
    user.password_hash = sha512(password, serverSalt).passwordHash;
    user.type = UserRole.Registrator;

    try {
        await db.createUser(user);
        res.redirect('/users');
    } catch(err) {
        console.error({ suka: err });
        res.render('logintaken');
    }
})
