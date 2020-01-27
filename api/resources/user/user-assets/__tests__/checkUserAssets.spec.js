import fs from 'fs'
import * as assetsController from '../assets.controller'

// jest.mock('../assets.controller', () => {
//   const actual = require.requireActual('../assets.controller')
//   return {
//     ...actual,
//     removeFileRecursive: jest.fn(() => 'executed')
//   }
// })

describe('checkUserAssets:', () => {
  test('calls a function to remove users asset folder if found.', () => {
    const req = {
      user: {
        handle: 'Kilza'
      }
    }
    const next = () => {}

    fs.mkdir('media/Kilza', err => {
      if (err) console.error(err)
      console.log('media/Kilza created for mock function')

      assetsController.checkUserAssets(req, {}, next)

      expect(fs.existsSync(`/media/${req.user.handle}`)).toBe(false)
    })
  })
})
