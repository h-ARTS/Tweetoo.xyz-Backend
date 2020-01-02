import { Schema, model, SchemaTypes } from 'mongoose'
// Safer than md5 hash which can be cracked faster by a super computer.
import bcrypt from 'bcrypt'
import { FollowerSchema } from './follower.schema'
import { TweetSchema } from '../tweet/tweet.model'
import { ImageFileSchema } from './image-upload/imagefile.schema'

const userSchema = new Schema(
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
      type: [SchemaTypes.ObjectId],
      default: []
    }
  },
  {
    timestamps: true
  }
)

userSchema.pre('save', function(next) {
  if (!this.isModified('password')) {
    return next()
  } else {
    bcrypt.hash(this.password, 10, (err, hash) => {
      if (err) {
        return next(err)
      }

      this.password = hash
      next()
    })
  }
})

userSchema.methods.verifyPassword = function entered(password) {
  const hashedPassword = this.password
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hashedPassword, (err, theyAreSame) => {
      if (err) {
        return reject(err)
      }

      resolve(theyAreSame)
    })
  })
}

export const User = model('user', userSchema)
