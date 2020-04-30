import * as fs from 'fs'
import { NextFunction, Request, Response } from 'express'

export const moveCachedFileToUserDir = (req: Request, res: Response, next: NextFunction) => {
  const { path, originalname, handle } = req.body
  const targetPath: string = `media/user/${handle}/${Date.now() + originalname}`
  fs.copyFile(`./${path}`, `./${targetPath}`, (err: Error|null): void => {
    if (err) throw err

    fs.rmdir(`./${path}`, () => {
      req.body.path = targetPath
      next()
    })
  })
}
