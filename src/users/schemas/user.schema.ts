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

    @Prop()
    githubId?: string;

    @Prop({
        type: String,
        trim: true,
    })
    googleId?: string;

    @Prop()
    avatar?: string;

    @Prop()
    avatarPublic?: string;

    @Prop({
        enum: ['local', 'google', 'github'],
        default: 'local',
    })
    provider!: 'local' | 'google' | 'github';

    @Prop()
    password?: string

    @Prop()
    refreshToken?: string;

    @Prop({
        enum: Role,
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

    @Prop()
    emailVerificationTokenExpires?: Date;

    @Prop({
        default: 0,
    })
    failedLoginAttempts!: number;

    @Prop()
    lockUntil?: Date;

    @Prop({
        default: false,
    })
    twoFactorEnabled!: boolean;

    @Prop()
    twoFactorSecret?: string;

    @Prop({ type: [String], default: [] })
    twoFactorRecoveryCodes!: string[];


}    

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index(
        { googleId : 1},
        {
            unique: true,
            partialFilterExpression: {
                googleId: { $type: 'string'},
            },
        },
    );
