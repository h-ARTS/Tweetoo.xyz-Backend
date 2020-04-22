import { Schema, Document } from 'mongoose'

export interface IFollower extends Document {
  handle: string
}

export const FollowerSchema = new Schema({
  //
  // This is basically the user (mongodb) Id that references to the user model.
  // It uses the same ObjectId as the users one for better quering.
  handle: {
    type: String,
    ref: 'user',
    unique: true,
    required: true
  }
})

FollowerSchema.index({ user: 1 }, { unqiue: true })
