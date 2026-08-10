import express from 'express';
import * as ctrl from '../controllers/auth.js';
import { ensureGuest } from '../middlewares/auth.js';

const router = express.Router();

router.get('/register', ensureGuest, ctrl.showRegister);
router.post('/register', ensureGuest, ctrl.register);
router.get('/login', ensureGuest, ctrl.showLogin);
router.post('/login', ensureGuest, ctrl.login);
router.post('/logout', ctrl.logout);

export default router;