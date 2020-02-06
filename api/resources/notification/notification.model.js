import { Schema, model, SchemaTypes } from 'mongoose'

export const notificationSchema = new Schema(
  {
    type: {
      type: String,
      required: true
    },
    sender: {
      type: String,
      required: true
    },
    recipient: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    tweetId: SchemaTypes.ObjectId,
    replyId: SchemaTypes.ObjectId
  },
  { timestamps: true }
)

export const Notification = model('notification', notificationSchema)
