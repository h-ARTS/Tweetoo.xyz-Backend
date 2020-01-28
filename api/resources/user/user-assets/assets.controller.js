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

export const removeFile = path => {
  return fs.unlink(path, err => {
    if (err) throw err
    console.log(`${path} is deleted!`)
  })
}

export const checkUserAssets = (req, _, next) => {
  const path = `media/${req.user.handle}`
  if (fs.existsSync(path)) {
    return removeFileRecursive(path, () => {
      next()
    })
  } else {
    return next()
  }
}
