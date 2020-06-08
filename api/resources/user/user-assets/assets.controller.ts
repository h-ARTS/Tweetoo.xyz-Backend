import * as fs from 'fs'
import { NextFunction, Response } from 'express'
import { IRequestUser } from '../../../utils/auth'
import { removeFileRecursive } from '../../../utils/filesystem.utils'

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
