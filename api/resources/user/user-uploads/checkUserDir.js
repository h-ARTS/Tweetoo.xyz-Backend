import fs from 'fs'

export const removeFileRecursive = (path, callback) => {
  fs.readdir(path, (_, files) => {
    files.forEach(file => {
      const currentPath = `${path}/${file}`
      if (fs.lstatSync(currentPath).isDirectory()) {
        removeFileRecursive(currentPath)
      } else {
        fs.unlinkSync(currentPath)
      }
    })
  })
  fs.rmdirSync(path)
  callback()
}

export default (req, _, next) => {
  const path = `media/${req.user.handle}`
  if (fs.existsSync(path)) {
    removeFileRecursive(path, () => next())
  } else {
    return next()
  }
}
