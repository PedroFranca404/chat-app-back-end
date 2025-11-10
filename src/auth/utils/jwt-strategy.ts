import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../auth.service";

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!
    })
  }

  async getTokens(user_id: number) {
    const accessToken = await this.authService.getAccessToken(user_id)
    const refreshToken = await this.authService.getRefreshToken(user_id)
    return { accessToken, refreshToken }
  }
}