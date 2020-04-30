import { Schema, SchemaTypes, model, Document } from 'mongoose'

export interface ITweet extends Document {
  // TODO: Remove tweetId when exact type defined in crud.ts (reTweet)
  tweetId?: any,
  fullText: string,
  likeCount: number,
  retweetCount: number,
  // TODO: Replace any with exact type
  replies: any,
  fullName: string,
  createdBy: Schema.Types.ObjectId,
  handle: string,
  userImageUrl: string
}

export interface IUserTweet extends Document {
  retweet: boolean,
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
    fullName: {
      type: String,
      required: true
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
    userImageUrl: {
      type: String,
      default: ''
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

// TweetSchema.index({ user: 1, handle: 1 }, { unique: true })

export const Tweet = model<ITweet>('tweet', TweetSchema)
