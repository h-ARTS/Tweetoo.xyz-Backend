import { removeFile } from '../user/user-assets/assets.controller'
import { CachedFiles } from './cachedFiles.model'

export const assignCachedImagePath = async (req, res) => {
  try {
    const { path } = req.file
    const { dimension, handle } = req.body
    if (!dimension) {
      removeFile(path)
      return res.status(500).send({
        message: 'Dimension not provided!'
      })
    }

    const cached = await CachedFiles.create({
      path: path,
      handle
    })

    return res.status(201).json({ cached, handle })
  } catch (e) {
    console.error(e)
    return res.status(500).end()
  }
}
