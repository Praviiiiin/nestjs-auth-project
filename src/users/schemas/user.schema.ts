import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose';
import { Role } from 'src/auth/enums/role.enum';

export type UserDocument = User & Document;

@Schema({
    timestamps: true,
})

export class User {
    @Prop({
        required: true,
    })
    name! :string;

    @Prop({
        required:true,
        unique:true
    })
    email! :string;

    @Prop({
        required:true
    })
    password! :string

    @Prop()
    refreshToken?: string;

    @Prop({
        default: Role.USER,
    })
    role!: Role;

    @Prop()
    resetPassword?: string;

    @Prop()
    resetPasswordExpires?: Date;

    @Prop({
        default: false,
    })
    isVerified!: boolean;

    @Prop()
    emailVerificationToken?: string;

    @Prop({
        default: 0,
    })
    failedLoginAttempts!: number;

    @Prop()
    lockUntil?: Date;

}    

export const UserSchema = SchemaFactory.createForClass(User)
