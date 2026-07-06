import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, it } from 'node:test';
import { expect, jest } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';


describe('AuthService', () => {

  let module: TestingModule;

  let authService: AuthService;

  let userService: { findByEmail: jest.Mock<any> };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      
      providers: [
        AuthService,

        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: 'MAIL_PROVIDER',
          useValue: {}
        }
      ],
    }).compile();
    authService = module.get(AuthService);
    userService = module.get(UsersService);
  })

  it(
    'Should throw BadRequestException if user does not exists',

    async() => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'john@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(
        BadRequestException,
      );
    },
  );

  it(
    'should throw BadRequestException when account is locked',
    async () => {
      const fakeUser = {
        email: 'john@example.com',
        password: 'hashed-password',
        lockUntil: new Date(
          Date.now() + 60 * 60 * 1000, 
        ),
      };
      
      userService.findByEmail.mockResolvedValue(
        fakeUser,
      );

      await expect(
        authService.login({
          email: 'john@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(
        'Account is temporarily locked. Try again later'
      );
    },
  );
})