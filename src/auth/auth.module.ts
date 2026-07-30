import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesGuard } from './guards/roles.guard';
import { MailModule } from 'src/mail/mail.module';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from 'src/mail/constants/queue.constants';
import { GoogleStrategy } from './strategies/google.strategy';
import { GithubStrategy } from './strategies/github.strategy';

@Module({
  imports: [
    UsersModule,    
    PassportModule,
    MailModule,
  
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
        expiresIn: '7d'
      },
    }),
  }),

  BullModule.registerQueue({
      name: QUEUES.MAIL,
    }),
],

  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard, GoogleStrategy, GithubStrategy],
  exports:[AuthService]
})

export class AuthModule {}
