import { Schema, SchemaTypes, model, Document, Types } from 'mongoose'
import { ImageFileSchema, IImageFile } from '../user/user-assets/imagefile.schema'

export interface ITweet extends Document {
  // TODO: Remove tweetId when exact type defined in crud.ts (reTweet)
  tweetId?: any
  fullText: string
  likeCount: number
  retweetCount: number
  replies: Types.Array<Schema.Types.ObjectId>
  fullName: string
  createdBy: Schema.Types.ObjectId
  handle: string
  tweetImages: Types.Array<IImageFile>
}

export interface IUserTweet extends Document {
  retweet: boolean
  tweetId?: Schema.Types.ObjectId
}

export const TweetSchema: Schema = new Schema(
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
    replies: {
      type: [SchemaTypes.ObjectId],
      default: []
    },
    createdBy: {
      type: SchemaTypes.ObjectId,
      required: true,
      ref: 'user'
    },
    handle: {
      type: String,
      required: true
    },
    tweetImages: {
      type: [ImageFileSchema],
      default: []
    }
  },
  { timestamps: true }
)

export const UserTweetSchema: Schema = new Schema({
  retweet: {
    type: Boolean,
    default: false
  },
  tweetId: {
    type: SchemaTypes.ObjectId,
    required: true
  }
})

TweetSchema.index({ fullName: 'text', handle: 'text', fullText: 'text' })

export const Tweet = model<ITweet>('tweet', TweetSchema)
