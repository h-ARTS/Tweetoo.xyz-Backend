import { User } from '../user.model'
import { removeFile } from './assets.controller'

export const assignImagePath = async (req, res) => {
  try {
    const { originalname, mimetype, path } = req.file
    const { dimension } = req.body
    if (!dimension) {
      removeFile(path)
      return res.status(500).send({
        message: 'Dimension not provided!'
      })
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        [dimension]: {
          name: originalname,
          type: mimetype,
          url: path
        }
      },
      { new: true }
    )
      .lean()
      .exec()

    if (!user) {
      return res.status(400).end()
    }

    return res.status(201).json({ data: user })
  } catch (e) {
    console.error(e)
    return res.status(500).end()
  }
}
