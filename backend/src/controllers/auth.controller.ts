import type { RequestHandler } from 'express';
import { notImplemented } from '../lib/errors.js';

export const signInWithGoogle: RequestHandler = () => {
  throw notImplemented('Google sign-in');
};

export const getCurrentUser: RequestHandler = () => {
  throw notImplemented('Current user lookup');
};

export const signOut: RequestHandler = () => {
  throw notImplemented('Sign-out');
};
