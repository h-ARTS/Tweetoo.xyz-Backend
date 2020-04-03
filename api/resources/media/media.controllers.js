import fs from 'fs'
import { Media } from './media.model'
import { removeFile } from '../user/user-assets/assets.controller'

export const getMedia = (req, res) => {
  const { filename, tweetId, handle } = req.params
  if (!!tweetId && fs.existsSync(`media/tweet/${tweetId}/${filename}`)) {
    return res.status(200).sendFile(`/media/tweet/${tweetId}/${filename}`)
  } else if (!!handle && fs.existsSync(`media/user/${handle}/${filename}`)) {
    return res.status(200).sendFile(`/media/user/${handle}/${filename}`)
  } else {
    return res.status(404).end()
  }
}

export const assignCachedImagePath = async (req, res) => {
  try {
    const { path, mimetype, originalname } = req.file
    const { dimension, handle } = req.body
    if (!dimension) {
      removeFile(path)
      return res.status(500).send({
        message: 'Dimension not provided!'
      })
    }

    const cached = await Media.create({
      path,
      mimetype,
      originalname,
      handle,
      dimension
    })

    return res.status(201).json({
      cached
    })
  } catch (e) {
    console.error(e)
    return res.status(500).end()
  }
}

export const removeCachedMediaDoc = async (req, res, next) => {
  const { path } = req.body
  try {
    const removed = await Media.findOneAndRemove({
      path
    })
      .lean()
      .exec()

    if (!removed) {
      res.status(404)
      res.send({
        message: 'File not found.'
      })
    }

    const { dimension, originalname, mimetype } = removed
    req.body.dimension = dimension
    req.body.mimetype = mimetype
    req.body.originalname = originalname
    req.body.path = path

    next()
  } catch (e) {
    console.error(e)
    res.status(404)
    res.send({
      message: 'File not found.'
    })
  }
}

export default { assignCachedImagePath, getMedia, removeCachedMediaDoc }
