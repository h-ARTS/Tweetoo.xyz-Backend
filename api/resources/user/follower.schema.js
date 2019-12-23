import { Schema, SchemaTypes } from 'mongoose'

export const FollowerSchema = new Schema({
  //
  // This is basically the user (mongodb) Id that references to the user model.
  // It uses the same ObjectId as the users one for better quering.
  userId: {
    type: SchemaTypes.ObjectId,
    ref: 'user',
    required: true
  }
})

FollowerSchema.index({ user: 1 }, { unqiue: true })
