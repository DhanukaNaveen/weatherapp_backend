import { expressjwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import dotenv from 'dotenv';

dotenv.config();

const jwtCheck = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    cache: true,
    rateLimit: true,
  }),
  algorithms: ['RS256'],
  audience: process.env.API_IDENTIFIER,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
});

export default jwtCheck;