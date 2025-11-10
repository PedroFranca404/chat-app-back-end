import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignInDto, SignUpDto } from './utils/auth.dto';
import * as bcrypt from "bcrypt"
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async signUp(dto: SignUpDto) {
    console.log(dto)
    const existingEmail = await this.prisma.users.findUnique({ where: { email: dto.email } })
    if (existingEmail) throw new BadRequestException("Email already registered")

    const existingUsername = await this.prisma.users.findUnique({ where: { username: dto.username } })
    if (existingUsername) throw new BadRequestException("Username already registered")

    const hashedPw = await bcrypt.hash(dto.password, 10)
    
    
    const user = await this.prisma.users.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPw
      }
    })
    
    const accessTokenExpiresAt = new Date(Date.now() + 15*60*1000) // 15 min
    const accessToken = this.jwtService.sign({ id: user.id })
    
    await this.prisma.accessTokens.create({
      data: {
        token: accessToken,
        user_id: user.id,
        expires_at: accessTokenExpiresAt, // 15 min
      }
    })
    
    const refreshTokenExpiresAt = new Date(Date.now() + 7*24*60*60*1000) // 7 days
    const refreshToken = this.jwtService.sign({ id: user.id })

    await this.prisma.refreshTokens.create({
      data: {
        token: refreshToken,
        user_id: user.id,
        expires_at: refreshTokenExpiresAt, // 7 days
      }
    })

    return {
      message: "User created successfuly",
      user: { id: user.id, username: user.username, email: user.email },
      accessToken: accessToken,
      refreshToken: refreshToken
    }
  }

  async signIn(dto: SignInDto) {
    const user = await this.prisma.users.findUnique({ where: { email: dto.email } })
    if (!user) throw new UnauthorizedException("Invalid credentials")
  
    const passwordMatch = await bcrypt.compare(dto.password, user.password)
    if (!passwordMatch) throw new UnauthorizedException("Invalid credentials")

    const accessTokenExpiresAt = new Date(Date.now() + 15*60*1000) // 15 min
    const accessToken = this.jwtService.sign({ id: user.id })
    
    await this.prisma.accessTokens.create({
      data: {
        token: accessToken,
        user_id: user.id,
        expires_at: accessTokenExpiresAt, 
      }
    })

    const refreshTokenExpiresAt = new Date(Date.now() + 7*24*60*60*1000) // 7 days
    const refreshToken = this.jwtService.sign({ id: user.id })

    await this.prisma.refreshTokens.create({
      data: {
        token: refreshToken,
        user_id: user.id,
        expires_at: refreshTokenExpiresAt, 
      }
    })

    return {
      message: "Successful login",
      user: { id: user.id, username: user.username, email: user.email },
      accessToken: accessToken,
      refreshToken: refreshToken
    }
  }

  async signOut(userId: number) {
    await this.prisma.accessTokens.deleteMany({ where: { user_id: userId } })
    await this.prisma.refreshTokens.deleteMany({ where: { user_id: userId } })
    return { message: "Successful logout" }
  }

  async refresh(refreshToken: string, accessToken: string) {
    const payload = this.jwtService.verify(refreshToken)

    const storedToken = await this.prisma.refreshTokens.findUnique({ where: { token: refreshToken } })
    if (!storedToken || storedToken.expires_at < new Date()) {
      throw new UnauthorizedException("Invalid or expired refresh token")
    }

    const newAccessToken = this.jwtService.sign({ id: payload.id }, { expiresIn: "15m" })
    const newRefreshToken = this.jwtService.sign({ id: payload.id }, { expiresIn: "7d" })
    return { newAccessToken, newRefreshToken }
  }
} 
