import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { beforeEach, describe } from 'node:test';


describe('AuthService', () => {

  let module: TestingModule;

  let authService: AuthService;

  let userService: UsersService; 

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthService,
      ],
    }).compile();

    
  })
})