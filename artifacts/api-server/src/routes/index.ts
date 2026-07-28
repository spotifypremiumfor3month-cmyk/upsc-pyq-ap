import { Router, type IRouter } from 'express';
import healthRouter from './health.js';
import postsRouter  from './posts.js';
import mcqsRouter   from './mcqs.js';
import adminRouter  from './admin.js';
import seedRouter   from './seed.js';

const router: IRouter = Router();

router.use(healthRouter);
router.use(postsRouter);
router.use(mcqsRouter);
router.use(adminRouter);
router.use(seedRouter);

export default router;
