import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    UsersModule,

    PassportModule,
  
    JwtModule.register({
      secret: 'super-secret-key',
      signOptions: {
        expiresIn: '7d',
      },
    }),
  ],

  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})

export class AuthModule {}
