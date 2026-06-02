import express from 'express';
import * as ctrl from '../controllers/auth.js';
const router = express.Router();

router.get('/register', ctrl.showRegister);
router.post('/register', ctrl.register);
router.get('/login', ctrl.showLogin);
router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);

export default router;