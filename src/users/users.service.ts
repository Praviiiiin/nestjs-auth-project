import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema'

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

    async findAll() {
        return this.userModel.find().select('-password -refreshToken');
    }

    async findUserById(
        id: string,
    ) {
        return this.userModel.findById(id).select('-password -refreshToken');
    }

    async deleteUser(id: string) {
        return this.userModel.findByIdAndDelete(id);
    }
}
