import { User } from '../user.model'
import { FollowerSchema } from '../follower.schema'
import { ImageFileSchema } from '../image-upload/imagefile.schema'
import { SchemaTypes, Schema } from 'mongoose'
import { UserTweetSchema } from '../../tweet/tweet.model'
import { UserReplySchema } from '../../reply/reply.model'

describe('User model:', () => {
  describe('schema', () => {
    test('has email', () => {
      const email = User.schema.obj.email
      expect(email).toEqual({
        type: String,
        required: true,
        unique: true,
        trim: true
      })
    })

    test('has handle', () => {
      const handle = User.schema.obj.handle
      expect(handle).toEqual({
        type: String,
        unqiue: true,
        trim: true,
        required: true
      })
    })

    test('has fullName', () => {
      const fullName = User.schema.obj.fullName
      expect(fullName).toEqual({
        type: String,
        required: true,
        maxlength: 30
      })
    })

    test('has password', () => {
      const password = User.schema.obj.password
      expect(password).toEqual({
        type: String,
        required: true
      })
    })

    test('has bio', () => {
      const bio = User.schema.obj.bio
      expect(bio).toEqual(String)
    })

    test('has location', () => {
      const location = User.schema.obj.location
      expect(location).toEqual(String)
    })

    test('has website', () => {
      const website = User.schema.obj.website
      expect(website).toEqual(String)
    })

    test('has birthday', () => {
      const birthday = User.schema.obj.birthday
      expect(birthday).toEqual(Date)
    })

    test('has userImage', () => {
      const userImage = User.schema.obj.userImage
      expect(userImage).toEqual(ImageFileSchema)
    })

    test('has coverImage', () => {
      const coverImage = User.schema.obj.coverImage
      expect(coverImage).toEqual(ImageFileSchema)
    })

    test('has following as array', () => {
      const following = User.schema.obj.following
      expect(following).toEqual({
        type: [FollowerSchema],
        default: []
      })
    })

    test('has followers as array', () => {
      const followers = User.schema.obj.followers
      expect(followers).toEqual({
        type: [FollowerSchema],
        default: []
      })
    })

    test('has tweets as array', () => {
      const tweets = User.schema.obj.tweets
      expect(tweets).toEqual({
        type: [UserTweetSchema],
        default: []
      })
    })

    test('has replies as array', () => {
      const replies = User.schema.obj.replies
      expect(replies).toEqual({
        type: [UserReplySchema],
        default: []
      })
    })

    test('has isBanned', () => {
      const isBanned = User.schema.obj.isBanned
      expect(isBanned).toEqual({
        type: Boolean,
        default: false
      })
    })

    test('has isVerified', () => {
      const isVerified = User.schema.obj.isVerified
      expect(isVerified).toEqual({
        type: Boolean,
        default: false
      })
    })
  })

  describe('custom method verifyPassword', () => {
    test('resolves true if password matches.', async () => {
      await User.create({
        email: 'max@mustard.com',
        password: '123456',
        fullName: 'Max Mustard',
        handle: 'maxmustard'
      })

      const user = await User.findOne({
        email: 'max@mustard.com'
      })
        .select('email password')
        .exec()

      await expect(user.verifyPassword('123456')).resolves.toBe(true)
    })

    test('throws error if password does not match', async () => {
      await User.create({
        email: 'max@mustard.com',
        password: '123456',
        fullName: 'Max Mustard',
        handle: 'maxmustard'
      })

      const user = await User.findOne({
        email: 'max@mustard.com'
      })
        .select('email password')
        .exec()

      await expect(user.verifyPassword('wrongPAssowrD31')).resolves.toBe(false)
    })
  })
})
