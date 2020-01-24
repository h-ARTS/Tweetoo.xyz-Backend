import fs from 'fs'
import { removeFileRecursive } from '../checkUserDir'

describe('User asset uploads:', () => {
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

    test('removes the directory and all the files', () => {
      removeFileRecursive(path, () => {
        expect(fs.existsSync(path)).toBeFalsy()
      })
    })
  })

  // TODO: Create test for the checkUserDir middleware.
})
