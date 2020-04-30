import { Schema, SchemaTypes, model, Document } from 'mongoose'

export interface IReply extends Document {
  tweetId: Schema.Types.ObjectId,
  fullText: string,
  likeCount: number,
  retweetCount: number,
  createdBy: Schema.Types.ObjectId,
  fullName: string,
  handle: string,
  userImageUrl: string
}

export interface IUserReply extends Document {
  retweet: boolean,
  replyId?: Schema.Types.ObjectId,
  tweetId?: Schema.Types.ObjectId
}

export const replySchema: Schema = new Schema(
  {
    tweetId: {
      type: SchemaTypes.ObjectId,
      // required: true,
      ref: 'tweet'
    },
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
    createdBy: {
      type: SchemaTypes.ObjectId,
      required: true,
      ref: 'user'
    },
    fullName: {
      type: String,
      required: true
    },
    handle: {
      type: String,
      required: true
    },
    userImageUrl: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

export const UserReplySchema: Schema = new Schema({
  retweet: {
    type: Boolean,
    default: false
  },
  replyId: {
    type: SchemaTypes.ObjectId,
    required: true
  },
  tweetId: {
    type: SchemaTypes.ObjectId,
    required: true
  }
})

// replySchema.index({ user: 1, tweet: 1 }, { unique: true })

export const Reply = model<IReply>('reply', replySchema)
