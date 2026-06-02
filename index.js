import express from 'express';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import session from 'express-session';

import clienteRouter from './routes/clienteRoutes.js';
import authRouter from './routes/auth.js';
import manutencaoRouter from './routes/manutencaoRoutes.js';
import componenteRouter from './routes/componenteRoutes.js';
import routeRouter from './routes/route.js';


const app = express();

// 🔗 Conexão com MongoDB
const mongoUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/manutencao_computadores';
mongoose.connect(mongoUrl)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Erro MongoDB:', err));

// Middleware para ler body do formulário
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware para servir arquivos estáticos (CSS/JS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(join(__dirname, 'public')));

// Configuração do view engine
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

// Configuração da sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'troque_estachave',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000*60*60*24 }
}));

// Disponibiliza usuário nas views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.userNome || null;
  next();
});

// Rotas principais
// Rotas principais
app.use('/cliente', clienteRouter);
app.use('/auth', authRouter);

// 🔧 Rotas de Assistência Técnica
app.use('/manutencoes', manutencaoRouter);
app.use('/componentes', componenteRouter);

// Rota raiz
app.use('/', routeRouter);



// 🚀 Servidor
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));

export default app;
