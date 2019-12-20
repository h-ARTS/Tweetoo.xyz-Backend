import { User } from './user.model'

export const myProfile = (req, res) => {
  res.status(200).json({ data: req.user })
}

export const updateProfile = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true
    })
      .lean()
      .exec()

    res.status(200).json({ data: updated })
  } catch (e) {
    console.error(e)
    res.status(400).end()
  }
}

export const controllers = {
  myProfile: myProfile,
  updateProfile: updateProfile
}
