import * as fs from 'fs'
import * as multer from 'multer'
import { Request } from 'express'

const storage: multer.StorageEngine = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void): void => {
    const targetPath: string =
      !req.params || req.params.handle !== ''
        ? req.params.type === 'newuser'
          ? './media/cached/'
          : `./media/user/${req.params.handle}/`
        : `./media/tweet/${req.params.tweetId}/`

    return fs.mkdir(targetPath, { recursive: true }, () => {
      cb(null, targetPath)
    })
  },
  filename: (req: Request, file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void): void => {
    cb(null, Date.now() + file.originalname)
  }
})

const fileFilter = (req: Request, file: Express.Multer.File,
  cb: multer.FileFilterCallback): void => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/gif' ||
    file.mimetype === 'image/webp'
  ) {
    return cb(null, true)
  } else {
    return cb(new Error(`File type ${file.mimetype} not allowed to upload.`))
  }
}

export const userImageUpload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 7
  },
  preservePath: true,
  fileFilter: fileFilter
}).single('image')

export const tweetImageUpload = multer({
  storage: null,
  limits: {
    fileSize: 1024 * 1024 * 7
  },
  preservePath: true,
  fileFilter
}).array('tweet-images', 6)
