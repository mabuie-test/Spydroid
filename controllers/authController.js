const User = require('../models/User');
const jwt  = require('jsonwebtoken');

exports.register = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    await new User({ username, password }).save();
    res.status(201).json({ message: 'Usuário criado' });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Usuário já existe' });
    next(e);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Credenciais inválidas' });
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (e) {
    next(e);
  }
};
