import { Notification } from './notification.router'

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })

    res.status(200).json({ notifications })
  } catch (e) {
    res.status(404).send(e)
  }
}

export const notifyOnLike = async (req, res) => {}

export default { getNotifications }
