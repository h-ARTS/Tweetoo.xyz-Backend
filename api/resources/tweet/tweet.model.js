import { Schema, SchemaTypes, model } from 'mongoose'

export const TweetSchema = new Schema(
  {
    fullText: {
      type: String,
      required: true,
      maxlength: 280
    },
    likeCount: {
      type: Number,
      default: 0
    },
    retweetCount: {
      type: Number,
      default: 0
    },
    replyCount: {
      type: Number,
      default: 0
    },
    fullName: {
      type: String,
      required: true
    },
    userId: {
      type: SchemaTypes.ObjectId,
      required: true,
      ref: 'user'
    },
    handle: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

TweetSchema.index({ user: 1, handle: 1 }, { unique: true })

export const Tweet = model('tweet', TweetSchema)
