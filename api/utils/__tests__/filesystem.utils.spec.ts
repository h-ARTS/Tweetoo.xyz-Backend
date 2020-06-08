import * as fs from 'fs'
import { removeFileRecursive, removeFile } from '../filesystem.utils'

describe('Filesystem utility functions', () => {
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
})
