import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { refreshDto, SignInDto, signOutDto, SignUpDto } from "./utils/auth.dto";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private readonly accessTokenExpiryString = "5h"; // 15 min
  private readonly refreshTokenExpiryString = "7d"; // 7 days

  async signUp(dto: SignUpDto) {
    const existingEmail = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail)
      throw new BadRequestException("Email already registered");

    const existingUsername = await this.prisma.users.findUnique({
      where: { username: dto.username },
    });
    if (existingUsername)
      throw new BadRequestException("Username already registered");

    const hashedPw = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.users.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPw,
      },
    });

    const accessToken = this.jwtService.sign(
      { id: user.id },
      { expiresIn: this.accessTokenExpiryString },
    );

    const refreshToken = this.jwtService.sign(
      { id: user.id },
      { expiresIn: this.refreshTokenExpiryString },
    );

    return {
      message: "User created successfully",
      user: { id: user.id, username: user.username, email: user.email },
      accessToken,
      refreshToken,
    };
  }

  async signIn(dto: SignInDto) {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException("Invalid credentials");

    const accessToken = this.jwtService.sign(
      { id: user.id },
      { expiresIn: this.accessTokenExpiryString },
    );

    const refreshToken = this.jwtService.sign(
      { id: user.id },
      { expiresIn: this.refreshTokenExpiryString },
    );

    return {
      message: "Successful login",
      user: { id: user.id, username: user.username, email: user.email },
      accessToken,
      refreshToken,
    };
  }

  async signOut(dto: signOutDto) {
    // Stateless logout: nothing to delete
    return { message: "Successful logout" };
  }

  async refresh(dto: refreshDto) {
    let payload;
    try {
      payload = this.jwtService.verify(dto.refreshToken);
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    const newAccessToken = this.jwtService.sign(
      { id: payload.id },
      { expiresIn: this.accessTokenExpiryString },
    );

    const newRefreshToken = this.jwtService.sign(
      { id: payload.id },
      { expiresIn: this.refreshTokenExpiryString },
    );

    return { newAccessToken, newRefreshToken };
  }
}
