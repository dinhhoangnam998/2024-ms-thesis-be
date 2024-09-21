import { appEnv } from '#src/config/env.js';
import jwt from 'jsonwebtoken';
import { Role } from './role.js';

function authen(req, res, next) {
  if (!req.headers['authorization']) return res.status(401).send('Access Denied. Authorization header is required!');
  const token = req.headers['authorization'].split(' ')[1];
  if (!token) return res.status(401).send('Access Denied. Check your Authorization header format! (Bearer token)');
  try {
    const verified = jwt.verify(token, appEnv.JWT_SECRET);
    req.caller = verified;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'TokenExpiredError' });
    }
    next(err);
  }
}

function author(roles) {
  return function (req, res, next) {
    if (req.caller.roles.includes(Role.Admin)) return next();
    const intersection = roles.filter((role) => req.caller.roles.includes(role));
    if (intersection.length === 0) return res.status(403).send('Forbidden!');
    next();
  };
}

export { authen, author };
