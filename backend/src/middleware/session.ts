import session from 'express-session';
import MongoStore from 'connect-mongo';
import { env, isProduction, isTest } from '../config/env.js';

const sessionTtlMs = 7 * 24 * 60 * 60 * 1000;

export const SESSION_COOKIE_NAME = 'scenetone.sid';

const store = isTest
  ? undefined
  : MongoStore.create({
      mongoUrl: env.MONGODB_URI,
      collectionName: 'sessions',
      ttl: sessionTtlMs / 1000,
      autoRemove: 'native',
    });

export const sessionMiddleware = session({
  name: SESSION_COOKIE_NAME,
  secret: env.SESSION_SECRET,
  store,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: sessionTtlMs,
  },
});
