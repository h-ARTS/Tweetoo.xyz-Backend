import { Schema, Document } from 'mongoose'
export interface IImageFile extends Document {
  name: String,
  type: string,
  url: string,
  mediaId?: string
}

export const ImageFileSchema = new Schema({
  name: {
    type: String,
    required: true,
    default: 'no_cover.jpg'
  },
  type: {
    type: String,
    required: true,
    default: 'image/jpeg'
  },
  url: {
    type: String,
    required: true,
    default: 'media/standard/no_cover.jpg'
  },
  mediaId: {
    type: String,
    required: false
  }
})
