import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
@Module({
  imports: [AuthModule, PrismaModule, PassportModule.register({ defaultStrategy: "jwt" })]
})
export class AppModule {}
