import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../auth.service";

export class JwtStrategy extends PassportStrategy(Strategy) {
  validate(...args: any[]): unknown {
    throw new Error("Method not implemented.");
  }
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }
}
