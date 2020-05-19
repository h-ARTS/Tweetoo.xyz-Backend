import { Schema, model, Document } from 'mongoose'

const enum Dimension {
  UserImage = 'userImage',
  CoverImage = 'coverImage'
}

export interface IMedia extends Document {
  path: string,
  mimetype: string,
  originalname: string,
  handle: string,
  dimension?: Dimension
}

const mediaSchema = new Schema(
  {
    path: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    originalname: {
      type: String,
      required: true
    },
    handle: {
      type: String,
      required: true
    },
    dimension: {
      type: String
    }
  },
  { timestamps: true }
)

export const Media = model<IMedia>('media', mediaSchema)
