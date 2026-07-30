import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema'
import { Role } from 'src/auth/enums/role.enum';
import { RedisService } from 'src/redis/redis.service';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';
import { CACHE_KEYS, CACHE } from 'src/mail/constants/cache.constants';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        private readonly redisService: RedisService,
    ) {}
    async create (data: Partial<User>) {
        return this.userModel.create(data);
    }

    async findByEmail (email: string) {
        return this.userModel.findOne({ email });
    }

    async findById(id: string) {

        type CachedUser = Omit<User, never> & { _id: string };
        const cacheKey = `${CACHE_KEYS.USER}`;
        const cachedUser = await this.redisService.get<CachedUser>(cacheKey);

        if(cachedUser) {
            return this.userModel.hydrate(cachedUser)
        }

        const user = await this.userModel.findById(id);

        if(!user) {
            return null;
        }

        await this.redisService.set(
            cacheKey,
            user,
            CACHE.USER_TTL,
        );

        return user;
    }

    async updateUser(
        id: string,
        updateData: UpdateUserDto,
    ) {
        const user = await this.userModel.findByIdAndUpdate(
            id,
            updateData,
            {
                returnDocument: "after",
            },
        );

        await this.redisService.del(`${CACHE_KEYS.USER}`)
        return user;
    }

    async updatePassword(
        id: string,
        password: string,
    ) {
        return this.userModel.findByIdAndUpdate(
            id,
            {
                password,
            },
            {
                returnDocument: "after"
            },
        );
    }

    async updateRefreshToken (
        id: string,
        refreshToken: string,
    ) {
        return this.userModel.findByIdAndUpdate(
            id,
            {
                refreshToken,
            },
            {
                returnDocument: "after",
            },
        );
    }

    async removeRefreshToken(
        id: string,
    ) {
        return this.userModel.findByIdAndUpdate(
            id,
            {
                refreshToken: null
            },
            {
                returnDocument: "after",
            },
        );
    }

    async findAll(
        page = 1,
        limit = 10,
        search = " ",
    ) {
        const filter = search? {
            $or: [
                {
                    name: {
                        $regex: search,
                        $options: 'i',
                    },
                },
                {
                    email: {
                        $regex: search,
                        $options: 'i',
                    },
                },
            ],
        }
        : {};
        const skip = (page - 1) * limit;
        const users = await this.userModel
            .find(filter)
            .select('-password -refreshToken')
            .skip(skip)
            .limit(limit);

        const total = await this.userModel.countDocuments(filter);

        return { total, page, limit, users };
    }

    async findUserById(
        id: string,
    ) {
        return this.userModel.findById(id).select('-password -refreshToken');
    }

    async deleteUser(id: string) {
        return this.userModel.findByIdAndDelete(id);
    }

    async updateRole(
        id: string,
        role: Role,
    ) {
        return this.userModel.findByIdAndUpdate(
            id,
            {
                role,
            },
            {
                returnDocument: 'after'
            }
        ).select('-password -refreshToken');
    }

    async updateResetToken(
        id: string,
        token: string,
        expires: Date,
    ) {
        return this.userModel.findByIdAndUpdate(
            id,
            {
                resetPassword: token,
                resetPasswordExpires: expires,
            },
            {
                returnDocument: 'after'
            },
        );
    }

    async findResetToken(
        token: string,
    ) {
        return this.userModel.findOne({
            resetPassword: token,
            resetPasswordExpires: {
                $gt: new Date(),
            },
        });
    }

    async clearResetToken(
        id: string,
    ) {
        return this.userModel.findByIdAndUpdate(
            id,
            {
                resetPassword: null,
                resetPasswordExpires: null,
            },
            {
                returnDocument: 'after'
            },
        );
    }

    async findByVerificationToken(
        token: string,
    ) {
        return this.userModel.findOne({
            emailVerificationToken: token,
        });
    }

    async updateLoginAttempts(
        id: string,
        attempts: 3,
        lockUntil?: Date,
    ) {
        return this.userModel.findByIdAndUpdate(
            id,
            {
                failedLoginAttempts: attempts,
                lockUntil,
            },
            {
                returnDocument: 'after'
            },
        );
    }

    async findByGoogleId(
        googleId: string
    ){
        return this.userModel.findOne({
            googleId,
        });
    }

    async updateGoogleAccount(
        id: string,
        googleId: string,
        avatar?: string,
    ) {
        return this.userModel.findByIdAndUpdate(
            id,
            {
                googleId,
                avatar,
                provider: 'google',
                isVerified: true,
            },
            {
                new: true,
            },
        );
    }

    async findByGithubId(
        githubId: string,
    ) {
        return this.userModel.findOneAndReplace({
            githubId,
        });
    }

    async updateGithubAccount(
        id: string,
        githubId: string,
        avatar?: string,
    ) {
        return this.userModel.findByIdAndUpdate(
            id,
            {
                githubId,
                avatar,
                provider: 'github'
            },
            {
                new: true
            },
        );
    }
}

