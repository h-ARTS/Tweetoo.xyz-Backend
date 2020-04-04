import fs from 'fs'

export const moveCachedFileToUserDir = (req, res, next) => {
  const { path, originalname, handle } = req.body
  const targetPath = `media/user/${handle}/${Date.now() + originalname}`
  fs.copyFile(`./${path}`, `./${targetPath}`, err => {
    if (err) throw err

    fs.rmdir(`./${path}`, () => {
      req.body.path = targetPath
      next()
    })
  })
}
