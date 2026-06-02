import express from 'express';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import session from 'express-session';

import carroRouter from '../routes/carroRoutes.js';
import clienteRouter from '../routes/clienteRoutes.js';
import reservaRouter from '../routes/reservaRoutes.js';
import pagamentoRouter from '../routes/pagamentoRoutes.js';
import routeRouter from '../routes/route.js';
import carroApiroutes from '../routes/carroApiroutes.js';
import authRouter from '../routes/auth.js';


const app = express();


// Middleware para ler body do formulário
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware para servir arquivos estáticos (CSS/JS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(join(__dirname, '../public')));

// Configuração do view engine
app.set('view engine', 'ejs');
app.set('views', join(__dirname, '../views'));
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
// SITE DO USUÁRIO
app.use('/site', express.static('site'));

// Rotas principais
app.use('/carro', carroRouter);
app.use('/cliente', clienteRouter);
app.use('/reserva', reservaRouter);
app.use('/pagamento', pagamentoRouter);
app.use('/auth', authRouter);
app.use('/api/carros', carroApiroutes);

// Rota raiz
app.use('/', routeRouter);



// 🚀 Servidor
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));

export default app;

