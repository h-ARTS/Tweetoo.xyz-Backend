import * as fs from 'fs'
import { checkUserAssets } from '../assets.controller'
import { IRequestUser } from '../../../../utils/auth'
import { Response } from 'express'

describe('User assets-controller:', () => {
  describe('checkUserAssets:', () => {
    test('calls a function to remove users asset folder if found.', () => {
      const req = {
        user: {
          handle: 'Kilza'
        }
      } as IRequestUser
      const next = () => { }

      fs.mkdir('media/user/Kilza', err => {
        if (err) console.error(err)
        console.log('media/user/Kilza created for mock function')

        checkUserAssets(req, {} as Response, next)

        expect(fs.existsSync(`/media/user/${req.user.handle}`)).toBe(false)
      })
    })
  })
})
