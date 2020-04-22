import * as fs from 'fs'
import { IRequestUser } from '../../../utils/auth'
import { NextFunction, Response } from 'express'

export const removeFileRecursive = 
  (path: string, callback: () => void): void => {
  fs.readdir(path, (_, files: string[]): void => {
    files.forEach(file => {
      const currentPath = `${path}/${file}`
      if (fs.lstatSync(currentPath).isDirectory()) {
        removeFileRecursive(currentPath, null)
      } else {
        fs.unlinkSync(currentPath)
      }
    })
  })
  fs.rmdirSync(path)
  callback()
}

export const removeFile = (path: string): void => {
  return fs.unlink(path, err => {
    if (err) throw err
    console.log(`${path} is deleted!`)
  })
}

export const checkUserAssets = (req: IRequestUser, res: Response, 
  next: NextFunction): void => {
  const path = `media/user/${req.user.handle}`
  if (fs.existsSync(path)) {
    return removeFileRecursive(path, () => {
      next()
    })
  } else {
    return next()
  }
}
