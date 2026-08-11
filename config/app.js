import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import clienteRouter from '../routes/clienteRoutes.js';
import authRouter from '../routes/auth.js';
import manutencaoRouter from '../routes/manutencaoRoutes.js';
import componenteRouter from '../routes/componenteRoutes.js';
import routeRouter from '../routes/route.js';

dotenv.config();

const mongoUrl = process.env.MONGODB_URI;

if (!mongoUrl) {
  throw new Error('Defina a variável MONGODB_URI no arquivo .env');
}

export const connectDatabase = async () => {
  if (mongoose.connection.readyState !== 0) return;

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Erro ao conectar com o MongoDB:', error);
    throw error;
  }
};

export const createApp = async () => {
  await connectDatabase();

  const app = express();

  app.disable('x-powered-by');
  app.use(helmet({
    contentSecurityPolicy: false
  }));

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const projectRoot = join(__dirname, '..');

  app.use(express.static(join(projectRoot, 'public')));
  app.set('view engine', 'ejs');
  app.set('views', join(projectRoot, 'views'));
  app.set('trust proxy', 1);

  let sessionStore = null;

  try {
    const { default: ConnectMongo } = await import('connect-mongo');
    sessionStore = ConnectMongo.create({
      mongoUrl,
      collectionName: 'sessions'
    });
    console.log('Session store MongoDB ativo');
  } catch (error) {
    console.warn('connect-mongo não disponível, usando armazenamento em memória. Instale connect-mongo para produção.');
  }

  app.use(session({
    secret: process.env.SESSION_SECRET || 'assisttech-tcc-secret-dev',
    resave: false,
    saveUninitialized: false,
    store: sessionStore || undefined,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24
    }
  }));

  app.use((req, res, next) => {
    res.locals.currentUser = req.session?.userNome || null;
    res.locals.currentPath = req.path;
    res.locals.flash = req.session?.flash || null;
    if (req.session?.flash) delete req.session.flash;
    next();
  });

  app.use('/auth', authRouter);
  app.use('/cliente', clienteRouter);
  app.use('/clientes', clienteRouter);
  app.use('/manutencoes', manutencaoRouter);
  app.use('/componentes', componenteRouter);
  app.use('/', routeRouter);

  app.use((req, res) => {
    res.status(404).render('error', {
      statusCode: 404,
      title: 'Página não encontrada',
      message: 'O endereço informado não existe ou não está mais disponível.'
    });
  });

  app.use((err, req, res, next) => {
    console.error('Erro na aplicação:', err);

    if (res.headersSent) {
      return next(err);
    }

    res.status(err.statusCode || 500).render('error', {
      statusCode: err.statusCode || 500,
      title: 'Não foi possível concluir a operação',
      message: 'Tente novamente em alguns instantes. Se o problema continuar, entre em contato com o responsável pelo sistema.'
    });
  });

  return app;
};
