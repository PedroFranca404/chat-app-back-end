import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  username: string;
}

export class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class signOutDto {
  accessToken: string;
  refreshToken: string;
}

export class refreshDto {
  accessToken: string;
  refreshToken: string;
}
