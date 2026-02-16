import { Request } from 'express';
import { JWTPayload } from './auth.types';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}
