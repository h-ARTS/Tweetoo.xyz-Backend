import { Schema, SchemaTypes, model, Document } from 'mongoose'

export interface ILike extends Document {
  docId: Schema.Types.ObjectId,
  createdBy: Schema.Types.ObjectId,
  handle: string
}

const likeSchema = new Schema(
  {
    docId: {
      type: SchemaTypes.ObjectId,
      required: true
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

export const Like = model<ILike>('like', likeSchema)
