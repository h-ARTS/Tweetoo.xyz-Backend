import * as fs from 'fs'
import { Request, Response, NextFunction } from 'express'

export const moveCachedFileToUserDir = (req: Request, res: Response, next: NextFunction) => {
  const { path, originalname, handle } = req.body
  const targetPath: string = `media/user/${handle}/${Date.now() + originalname}`
  fs.copyFile(`./${path}`, `./${targetPath}`, (err: Error | null): void => {
    if (err) throw err

    fs.rmdir(`./${path}`, () => {
      req.body.path = targetPath
      next()
    })
  })
}

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


export const removeFileAndReturnBody = (req: Request, res: Response) => {
  removeFile(req.body.path)

  res.status(200).json(req.body)
}