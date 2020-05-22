import * as fs from 'fs'
import { Media } from './media.model'
import { removeFile } from '../user/user-assets/assets.controller'
import { IRequestUser } from '../../utils/auth'
import { Response, Request, NextFunction } from 'express'

export const getMedia = (req: IRequestUser, res: Response): void => {
  const { filename, tweetId, handle } = req.params
  if (!!tweetId && fs.existsSync(`media/tweet/${tweetId}/${filename}`)) {
    return res.status(200).sendFile(`/media/tweet/${tweetId}/${filename}`)
  } else if (!!handle && fs.existsSync(`media/user/${handle}/${filename}`)) {
    return res.status(200).sendFile(`/media/user/${handle}/${filename}`)
  } else {
    return res.status(404).end()
  }
}

export const createUserFolder = (req: Request, res: Response): void => {
  fs.mkdir(`./media/user/${req.params.handle}`, err => {
    if (err) throw err
    console.log(`User directory for ${req.params.handle} created`)
    res.status(201)
    res.send(`User directory for ${req.params.handle} created.`)
  })
}

export const assignCachedImagePath = async (req: Request, res: Response):
  Promise<Response<{ message: string }> | void> => {
  const { path, mimetype, originalname } = req.file
  const { dimension, handle } = req.body

  if (!dimension || !handle) {
    removeFile(path)
    return res.status(400).send({
      message: `${!dimension ? 'Dimension' : 'User name'} not provided!`
    })
  }

  try {
    const cached = await Media.create({
      path,
      mimetype,
      originalname,
      handle,
      dimension
    })

    return res.status(201).json({ cached })
  } catch (e) {
    console.error(e)
    removeFile(path)
    return res.status(500).end()
  }
}

export const removeCachedMediaDoc = async (req: Request, res: Response, next: NextFunction):
  Promise<Response<{ message: string }> | void> => {
  const { uniqueImageId } = req.body
  try {
    const removed = await Media.findByIdAndRemove(uniqueImageId)
      .lean()
      .exec()

    if (!removed) {
      return res.status(404).send({ message: 'File not found.' })
    }

    const { _id, dimension, originalname, mimetype, handle, path } = removed
    req.body._id = _id
    req.body.dimension = dimension
    req.body.mimetype = mimetype
    req.body.originalname = originalname
    req.body.handle = handle
    req.body.path = path

    next()
  } catch (e) {
    console.error(e)
    return res.status(404).send({ message: 'File not found.' })
  }
}

export default {
  getMedia,
  createUserFolder,
  assignCachedImagePath,
  removeCachedMediaDoc
}
