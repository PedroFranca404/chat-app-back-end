import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './utils/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Post("sign-up")
  signUp(@Body() dto: SignUpDto){
    return this.authService.signUp(dto)
  }

  @Post("sign-in")
  signIn(@Body() dto: SignInDto){
    return this.authService.signIn(dto)
  }

  @Post("sign-out")
  signOut(@Body() userId: number){
    return this.authService.signOut(userId)
  }
}
