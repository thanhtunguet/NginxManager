import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
}));