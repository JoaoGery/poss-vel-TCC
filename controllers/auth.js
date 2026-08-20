import Usuario from '../models/Usuario.js';
import { normalizeEmail, sanitizeText, isValidEmail } from '../utils/validators.js';
import { setFlash } from '../utils/flash.js';

export const showRegister = (req, res) => {
  res.render('auth/register', { error: null, user: {} });
};

export const register = async (req, res) => {
  try {
    const nome = sanitizeText(req.body?.nome);
    const email = normalizeEmail(req.body?.email);
    const senha = String(req.body?.senha || '');

    if (!nome || !email || !isValidEmail(email) || senha.length < 6) {
      return res.status(400).render('auth/register', {
        error: 'Informe um nome válido, um e-mail correto e uma senha com pelo menos 6 caracteres.',
        user: { nome, email }
      });
    }

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).render('auth/register', {
        error: 'E-mail já cadastrado.',
        user: { nome, email }
      });
    }

    await Usuario.create({ nome, email, senha });
    setFlash(req, 'success', 'Cadastro realizado. Entre com suas credenciais para acessar o sistema.');
    return res.redirect('/auth/login');
  } catch (err) {
    console.error('Erro ao cadastrar usuário:', err);
    const msg = err.code === 11000 ? 'E-mail já cadastrado.' : 'Erro ao cadastrar usuário.';
    return res.status(400).render('auth/register', {
      error: msg,
      user: {
        nome: sanitizeText(req.body?.nome),
        email: normalizeEmail(req.body?.email)
      }
    });
  }
};

export const showLogin = (req, res) => {
  res.render('auth/login', { error: null });
};

export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const senha = String(req.body?.senha || '');

    if (!email || !isValidEmail(email) || !senha) {
      return res.status(400).render('auth/login', { error: 'Informe e-mail e senha válidos.' });
    }

    const user = await Usuario.findOne({ email });
    if (!user) {
      return res.status(400).render('auth/login', { error: 'Credenciais inválidas.' });
    }

    const ok = await user.compareSenha(senha);
    if (!ok) {
      return res.status(400).render('auth/login', { error: 'Credenciais inválidas.' });
    }

    req.session.userId = user._id;
    req.session.userNome = user.nome;
    const returnTo = req.session.returnTo;
    delete req.session.returnTo;
    return res.redirect(returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/');
  } catch (err) {
    console.error('Erro ao autenticar usuário:', err);
    return res.status(500).render('auth/login', { error: 'Erro ao autenticar.' });
  }
};

export const logout = (req, res) => {
  req.session.destroy(() => res.redirect('/auth/login'));
};
