import { Router } from 'express';
import InitHandler from './init.handler';

const router = Router();

router.get('/', InitHandler.Get);
router.post('/', InitHandler.Post);
router.put('/', InitHandler.Put);
router.delete('/', InitHandler.Delete);

export default router;