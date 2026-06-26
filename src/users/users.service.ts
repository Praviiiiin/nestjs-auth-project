import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema'
import { Role } from 'src/auth/enums/role.enum';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>
    ) {}

    async create (data: Partial<User>) {
        return this.userModel.create(data);
    }

    async findByEmail (email: string) {
        return this.userModel.findOne({ email });
    }

    async findById(id: string) {
        return this.userModel.findById(id);
    }

    async updateUser(
        id: string,
        updateData: any,
    ) {
        return this.userModel.findByIdAndUpdate(
            id,
            updateData,
            {
                returnDocument: "after",
            },
        );
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
        attempts: number,
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
}

