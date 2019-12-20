import { User } from '../user.model'
import { TweetSchema } from '../../tweet/tweet.model'
import { FollowerSchema } from '../follower.schema'

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

    test('has profileImage', () => {
      const profileImage = User.schema.obj.profileImage
      expect(profileImage).toEqual(String)
    })

    test('has coverImage', () => {
      const coverImage = User.schema.obj.coverImage
      expect(coverImage).toEqual(String)
    })

    test('has following as array', () => {
      const following = User.schema.obj.following
      expect(following).toEqual({
        type: [FollowerSchema],
        default: undefined
      })
    })

    test('has followers as array', () => {
      const followers = User.schema.obj.followers
      expect(followers).toEqual({
        type: [FollowerSchema],
        default: undefined
      })
    })

    test('has tweets as array', () => {
      const tweets = User.schema.obj.tweets
      expect(tweets).toEqual({
        type: [TweetSchema],
        default: undefined
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
