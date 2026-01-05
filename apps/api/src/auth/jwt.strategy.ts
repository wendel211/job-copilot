import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SEGREDO_SUPER_SECRETO', // Em produção, use process.env.JWT_SECRET
    });
  }

  async validate(payload: any) {
    // O retorno deste método é o que entra em "req.user" nos controllers
    return { id: payload.sub, email: payload.email };
  }
}