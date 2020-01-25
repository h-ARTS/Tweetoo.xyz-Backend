import fs from 'fs'
import { removeFileRecursive, removeFile } from '../assets.controller'

describe('User assets controller:', () => {
  describe('removeFileRecursive:', () => {
    const reqUserHandle = 'JohnDoe'
    const path = `media/${reqUserHandle}`
    beforeEach(() => {
      fs.mkdir(path, err => {
        if (err) throw err
        console.log('media/JohnDoe directory has been created.')
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
      const path = 'media/maxmustard/1577367080145optional.png'
      fs.copyFile('media/maxmustard/_1577367080145optional.png', path, () => {
        removeFile(path)
      })

      expect(fs.existsSync(path)).toBe(false)
    })
  })
})
