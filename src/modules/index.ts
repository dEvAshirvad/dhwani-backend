import express from 'express';
import initRouter from './init/init.router';
import reportRouter from './report/report.router';

const router = express.Router();

router.use('/init', initRouter);
router.use('/report', reportRouter);

export default router;