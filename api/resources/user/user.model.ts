import { Schema, model, Document, HookNextFunction, Types } from 'mongoose'
// Safer than md5 hash which can be cracked faster by a super computer.
import * as bcrypt from 'bcrypt'
import { FollowerSchema } from './follower.schema'
import { UserTweetSchema, ITweet } from '../tweet/tweet.model'
import { ImageFileSchema } from './user-assets/imagefile.schema'
import { UserReplySchema, IUserReply } from '../reply/reply.model'
import { ResolveType, RejectType } from '../../utils/auth'

export interface IUser extends Document {
  email: string,
  handle: string,
  fullName: string,
  password: string,
  bio?: string,
  location?: string,
  website?: string,
  birthday?: Date,
  userImage: any,
  coverImage: any,
  following: any[],
  followers: any[],
  tweets: Types.Array<ITweet>,
  replies: Types.Array<IUserReply>,
  isBanned: boolean,
  isVerified: boolean,
  verifyPassword: (password: string) => Promise<boolean>
}

const userSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    handle: {
      type: String,
      unqiue: true,
      trim: true,
      required: true
    },
    fullName: {
      type: String,
      required: true,
      maxlength: 30
    },
    password: {
      type: String,
      required: true
    },
    bio: String,
    location: String,
    website: String,
    birthday: Date,
    userImage: ImageFileSchema,
    coverImage: ImageFileSchema,
    following: {
      type: [FollowerSchema],
      default: []
    },
    followers: {
      type: [FollowerSchema],
      default: []
    },
    tweets: {
      type: [UserTweetSchema],
      default: []
    },
    replies: {
      type: [UserReplySchema],
      default: []
    },
    isBanned: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

userSchema.pre('save', (next: HookNextFunction): void => {
  if (!this.isModified('password')) {
    return next()
  } else {
    bcrypt.hash(this.password, 10, (err: Error|null, hash: string): void => {
      if (err) {
        return next(err)
      }

      this.password = hash
      next()
    })
  }
})

userSchema.methods.verifyPassword = function entered(password: string): Promise<boolean> {
  const hashedPassword = this.password
  return new Promise((resolve: ResolveType<boolean>, reject: RejectType): void => {
    bcrypt.compare(password, hashedPassword, (err: Error|null, theyAreSame: boolean) => {
      if (err) {
        return reject(err)
      }

      resolve(theyAreSame)
    })
  })
}

export const User = model<IUser>('user', userSchema)
