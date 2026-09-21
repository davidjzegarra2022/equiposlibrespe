const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
// Support either a precomputed bcrypt hash or a plain password from env.
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH ||
  bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'cambia-esta-clave', 10);

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }

  const validUser = username === ADMIN_USER;
  const validPassword = validUser && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);

  if (!validUser || !validPassword) {
    return res.status(401).json({ error: 'Credenciales incorrectas.' });
  }

  req.session.isAdmin = true;
  req.session.username = username;
  res.json({ ok: true, username });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  if (req.session && req.session.isAdmin) {
    return res.json({ isAdmin: true, username: req.session.username });
  }
  res.json({ isAdmin: false });
});

module.exports = router;
