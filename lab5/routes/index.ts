import * as express from 'express';

export const router = express.Router();
router.get('/', (_, res) => res.render('main', { title: 'Express' }));
