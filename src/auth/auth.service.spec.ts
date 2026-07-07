/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
    let module: TestingModule;

    let authService: AuthService;

    let userService: {
        findByEmail: jest.Mock;
        updateLoginAttempts: jest.Mock;
    };

    const mockedCompare = jest.mocked(bcrypt.compare) as unknown as jest.Mock;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            providers: [
                AuthService,

                {
                    provide: UsersService,
                    useValue: {
                        findByEmail: jest.fn(),
                        updateLoginAttempts: jest.fn(),
                    },
                },

                {
                    provide: JwtService,
                    useValue: {},
                },

                {
                    provide: 'MAIL_PROVIDER',
                    useValue: {},
                },
            ],
        }).compile();

        authService = module.get(AuthService);

        userService = module.get(UsersService);
    });

    it(
        'should throw BadRequestException if user does not exist',
        async () => {
            userService.findByEmail.mockResolvedValue(
                null,
            );

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
                    Date.now() +
                        60 * 60 * 1000,
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
                'Account is temporarily locked. Try again later.',
            );
        },
    );

    it(
        'should throw Invalid Credentials for incorrect password',
        async () => {
            const fakeUser = {
                _id: {
                    toString: () => '1',
                },
                email: 'john@example.com',
                password: 'hashed-password',
                failedLoginAttempts: 2,
                isVerified: true,
            };

            userService.findByEmail.mockResolvedValue(
                fakeUser,
            );

            mockedCompare.mockResolvedValue(false);

            await expect(
                authService.login({
                    email: 'john@example.com',
                    password: 'wrong-password',
                }),
            ).rejects.toThrow(
                'Invalid Credentials',
            );

            expect(
                userService.updateLoginAttempts,
            ).toHaveBeenCalledWith(
                '1',
                3,
            );
        },
    );
});