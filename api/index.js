import express from 'express';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import session from 'express-session';

import clienteRouter from '../routes/clienteRoutes.js';
import authRouter from '../routes/auth.js';
import manutencaoRouter from '../routes/manutencaoRoutes.js';
import componenteRouter from '../routes/componenteRoutes.js';
import routeRouter from '../routes/route.js';

const app = express();

const mongoUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/manutencao_computadores';

if (mongoose.connection.readyState === 0) {
  mongoose.connect(mongoUrl)
    .then(() => console.log('MongoDB conectado'))
    .catch(err => console.error('Erro MongoDB:', err));
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, '../public')));

app.set('view engine', 'ejs');
app.set('views', join(__dirname, '../views'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'troque_estachave',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use((req, res, next) => {
  res.locals.currentUser = req.session.userNome || null;
  next();
});

app.use('/cliente', clienteRouter);
app.use('/clientes', clienteRouter);
app.use('/auth', authRouter);
app.use('/manutencoes', manutencaoRouter);
app.use('/componentes', componenteRouter);
app.use('/', routeRouter);

export default app;
