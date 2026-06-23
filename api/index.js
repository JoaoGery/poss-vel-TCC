import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import session from 'express-session';

import clienteRouter from '../routes/clienteRoutes.js';
import authRouter from '../routes/auth.js';
import manutencaoRouter from '../routes/manutencaoRoutes.js';
import componenteRouter from '../routes/componenteRoutes.js';
import routeRouter from '../routes/route.js';

dotenv.config();

const app = express();

const mongoUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/manutencao_computadores';

if (mongoose.connection.readyState === 0) {
  mongoose.connect(mongoUrl)
    .then(() => console.log('MongoDB conectado'))
    .catch(err => console.error('Erro MongoDB:', err));
}

app.use(helmet());

let sessionStore;
try {
  const { default: ConnectMongo } = await import('connect-mongo');
  sessionStore = ConnectMongo.create({ mongoUrl });
} catch (err) {
  console.warn('connect-mongo não disponível, usando store em memória. Instale connect-mongo para produção.');
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, '../public')));

app.set('view engine', 'ejs');
app.set('views', join(__dirname, '../views'));
app.set('trust proxy', 1);

const sessionOptions = {
  secret: process.env.SESSION_SECRET || 'troque_estachave',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24
  }
};
if (sessionStore) sessionOptions.store = sessionStore;
app.use(session(sessionOptions));

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
