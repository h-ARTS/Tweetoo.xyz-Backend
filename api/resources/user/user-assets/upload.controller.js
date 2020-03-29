import { User } from '../user.model'
import { removeFile } from './assets.controller'

export const assignImagePath = async (req, res) => {
  try {
    const { dimension } = req.body
    let originalname, mimetype, path
    if (req.file) {
      path = req.file.path
      originalname = req.file.originalname
      mimetype = req.file.mimetype
    } else {
      path = req.body.path
      originalname = req.body.originalname
      mimetype = req.body.mimetype
    }
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
      .select('-password')
      .lean()
      .exec()

    if (!user) {
      return res.status(400).end()
    }

    return res.status(201).json(user)
  } catch (e) {
    console.error(e)
    return res.status(500).end()
  }
}
