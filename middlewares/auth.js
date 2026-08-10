export const ensureAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    // Mantém a página solicitada para que o usuário volte ao ponto certo após entrar.
    if (req.session && req.method === 'GET' && req.originalUrl.startsWith('/')) {
      req.session.returnTo = req.originalUrl;
    }
    return res.redirect('/auth/login');
  }

  return next();
};

export const ensureGuest = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/');
  }

  return next();
};
