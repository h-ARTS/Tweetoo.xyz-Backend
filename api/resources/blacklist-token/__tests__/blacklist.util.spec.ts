import * as jwt from 'jsonwebtoken'
import * as mongoose from 'mongoose'
import { checkBlacklisted } from '../blacklist.util'
import { newToken } from '../../../utils/auth'
import { Blacklist } from '../blacklist.model'

describe('Blacklist-utility:', () => {
  describe('checkBlacklisted: ', () => {
    test('it returns false if no blacklisted token found.', async () => {
      expect.assertions(2)

      const user = { id: mongoose.Types.ObjectId() }
      const token = newToken(user)

      const result = await checkBlacklisted(token)
      const db = await Blacklist.find()

      expect(result).toBe(false)
      expect(db).toHaveLength(0)
    })

    test('it removes the expired blacklisted token and return true.', async () => {
      expect.assertions(2)

      const user = { id: mongoose.Types.ObjectId() }
      const token = newToken(user)
      await Blacklist.create({ token, exp: 1578683384, iat: 1578683264 })

      const result = await checkBlacklisted(token)
      const db = await Blacklist.find()

      expect(result).toBe(true)
      expect(db).toHaveLength(0)
    })

    test('it returns true if blacklisted token is found.', async () => {
      expect.assertions(2)

      const user = { id: mongoose.Types.ObjectId() }
      const token = newToken(user)
      const { exp, iat }: any = jwt.decode(token)
      await Blacklist.create({ token, exp, iat })

      const result = await checkBlacklisted(token)
      const db = await Blacklist.find()

      expect(result).toBe(true)
      expect(db).toHaveLength(1)
    })
  })
})
