import { Router } from 'express';
import { submitApplication } from '../controllers/careers.controller';

const router = Router();

router.post('/', submitApplication);

export default router;
