import {Router} from "express"
import Container from "typedi";
import { DbService } from "../public/javascripts/db/db.service";
import { UserRole } from "../public/javascripts/db/entities/user.entity";

export const router = Router();
const db = Container.get(DbService);

router.get("/users", async (req, res, next) => {
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
router.get("/users:id", async (req, res, next) => {
    const user = await db.getUserById(req.params.id);
    if (!user) {
        return res.render("notfound");
    }

    res.render('user', user)
});
