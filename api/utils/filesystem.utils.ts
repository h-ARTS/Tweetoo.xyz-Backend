import * as fs from 'fs'
import { Request, Response, NextFunction } from 'express'
import { Media } from '../resources/media/media.model'

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

export const moveCachedImagesToTweetDir =
  (req: Request, res: Response, next: NextFunction) => {
    const { _id } = req.body.doc
    const tweetImages = req.body.tweetImages
    if (!tweetImages) return next()

    let imagesBody = new Set()

    fs.mkdir(`./media/tweets/${_id}`, (err: Error | null) => {
      if (err) throw err

      tweetImages.forEach(async image => {
        let media = await Media.findById(image.mediaId)
        if (!media) res.status(400).send('No Media doc found!')

        let targetPath: string = `media/tweets/${_id}/${media.originalname}`
        imagesBody.add({
          originalname: image.name,
          mimetype: image.type,
          path: targetPath,
          mediaId: media._id
        })

        fs.copyFile(`./${media.path}`, `./${targetPath}`,
          async (err: Error | null): Promise<void> => {
            if (err) throw err
            removeFile(media.path)

            media.path = targetPath
            await media.save()

            req.body.tweetImages = Array.from(imagesBody)
            next()
          })
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