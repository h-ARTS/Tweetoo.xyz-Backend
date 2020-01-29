import fs from 'fs'
import {
  removeFileRecursive,
  removeFile,
  checkUserAssets
} from '../assets.controller'

describe('User assets-controller:', () => {
  describe('removeFileRecursive:', () => {
    const reqUserHandle = 'JohnDoe'
    const path = `media/user/${reqUserHandle}`
    beforeEach(() => {
      fs.mkdir(path, err => {
        if (err) throw err
        console.log('media/user/JohnDoe directory has been created.')
        fs.writeFile(`${path}/test.txt`, 'A sample file', _ => {
          console.log('Test file has been created.')
        })
      })
    })

    test('removes the directory including files', () => {
      removeFileRecursive(path, () => {
        expect(fs.existsSync(path)).toBeFalsy()
      })
    })
  })

  describe('removeFile', () => {
    test('removes one file from the specified path.', () => {
      const path = 'media/user/maxmustard/1577367080145optional.png'
      fs.copyFile(
        'media/user/maxmustard/_1577367080145optional.png',
        path,
        () => {
          removeFile(path)
        }
      )

      expect(fs.existsSync(path)).toBe(false)
    })
  })

  describe('checkUserAssets:', () => {
    test('calls a function to remove users asset folder if found.', () => {
      const req = {
        user: {
          handle: 'Kilza'
        }
      }
      const next = () => {}

      fs.mkdir('media/user/Kilza', err => {
        if (err) console.error(err)
        console.log('media/user/Kilza created for mock function')

        checkUserAssets(req, {}, next)

        expect(fs.existsSync(`/media/user/${req.user.handle}`)).toBe(false)
      })
    })
  })
})
