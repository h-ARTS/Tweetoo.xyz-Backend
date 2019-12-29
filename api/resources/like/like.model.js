import { Schema, SchemaTypes, model } from 'mongoose'

const likeSchema = new Schema(
  {
    tweetId: {
      type: SchemaTypes.ObjectId,
      required: true,
      ref: 'tweet'
    },
    createdBy: {
      type: SchemaTypes.ObjectId,
      required: true,
      ref: 'user'
    },
    handle: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
)

export const Like = model('like', likeSchema)
