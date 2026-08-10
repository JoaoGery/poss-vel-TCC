export const setFlash = (req, type, message) => {
  if (req.session) {
    req.session.flash = { type, message };
  }
};

