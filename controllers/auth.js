import Usuario from '../models/Usuario.js';

export const showRegister = (req, res) => {
  res.render('auth/register', { error: null, user: {} });
};

export const register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    await Usuario.create({ nome, email, senha });
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    const msg = err.code === 11000 ? 'Email já cadastrado' : 'Erro ao cadastrar';
    res.status(400).render('auth/register', { error: msg, user: req.body });
  }
};

export const showLogin = (req, res) => {
  res.render('auth/login', { error: null });
};

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await Usuario.findOne({ email });
    if (!user) return res.status(400).render('auth/login', { error: 'Credenciais inválidas' });
    const ok = await user.compareSenha(senha);
    if (!ok) return res.status(400).render('auth/login', { error: 'Credenciais inválidas' });
    req.session.userId = user._id;
    req.session.userNome = user.nome;
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).render('auth/login', { error: 'Erro ao autenticar' });
  }
};

export const logout = (req, res) => {
  req.session.destroy(() => res.redirect('/'));
};