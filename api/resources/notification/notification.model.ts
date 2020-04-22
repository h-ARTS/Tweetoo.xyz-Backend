import { Schema, model, SchemaTypes, Document } from 'mongoose'

export interface INotification extends Document {
  type: string,
  snder: string,
  recipient: string,
  read: boolean,
  tweetId?: Schema.Types.ObjectId,
  replyId?: Schema.Types.ObjectId
}

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

export const Notification = model<INotification>('notification', notificationSchema)
