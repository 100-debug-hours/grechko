import type { Express } from "express";
import { Router } from "express";
import { verify, adminOrRegistrator } from "./auth";
import Container from "typedi";
import { DbService } from "../public/javascripts/db/db.service";
import { PubFormation } from "../public/javascripts/db/entities/pub-formation.entity";
import { User } from "../public/javascripts/db/entities/user.entity";

const db = Container.get(DbService);


const types = {
    'politicalParty':              'Політична партія',
    'publicFoundations':           'Громадська організація',
    'foreignPublicFoundation':     'Філія інозменої громадської організації',
    'charityFoundation':           'Благодійна організація',
    'сreativeUnion':               'Творча спілка',
    'chamberOfCommerce':           'Торгово промислова палата',
    'arbitrationCourt':            'Постійно діючий третейский суд',
    'socialInsuranceFoundation':   'Фонд соціального страхування',
    'localCommunity':              'Територіальна громада',
    'localAuthoritiesAssotiation': 'Асоціація органів місцевого самоврядування',
    'attorneyAssotiation':         `Адвокатське об'єднання`,
};

export const router = Router()
    .get("/formation", async (req, res, next) => {
        const formations = await db.getAllPubFormations('')

        formations.forEach(formation => {
            formation.type = types[formation.type];
            formation.registration_date = formation.registration_date.toString().slice(0, 24) as any ;
        });
        res.render('searchFormation', {
            formations,
            user: req.user
        });
    })
    .get(`/formations/:id`, async (req, res) => {
        const formation = await db.getPubFormationById(req.params.id);
        if (!formation) return res.render("/notfound");

        res.render('formation', { formation });
    })
    .get("/addFormation", verify(adminOrRegistrator), (req, res, next) => {
        res.render('addFormation', { types });
    })
    .post('/addFormation', verify(adminOrRegistrator), async (req, res, next) => {
        let formation = new PubFormation();
        Object.assign(formation, req.body);
        console.log("adding formation ...");
        console.table(formation);

        const user = req.user as User;

        formation.registrator_id = user.id;

        const createdFomration = await db.createPubFormation(formation);
        console.log(createdFomration);
        res.redirect(`/formation`)
    })
    .post('/editFormation/:id', async (req, res) => {
        let formation = new PubFormation();
        Object.assign(formation, req.body);
        console.log("editing formation ...");
        console.table(formation);

        formation.id = req.params.id;

        const updated = await db.updatePubFormation(formation);
        console.log(updated);
        res.redirect(`/formation`)
    })
    .get('/deleteFormation/:id', async (req, res) => {
        await db.deletePubFormation(req.params.id);
        res.redirect(`/formation`)
    })
    .get('/particularFormation/:id', async (req, res) => {
        const formation = await db.getPubFormationById(req.params.id);
        if (!formation) return res.render("/notfound");

        res.render('particularFormation', { user: req.user, types, ...formation });
    })
    .get('/editFormation/:id', async (req, res) => {
        const formation = await db.getPubFormationById(req.params.id);
        if (!formation) return res.render("/notfound");

        res.render('editFormation', { user: req.user, types, ...formation });
    });
