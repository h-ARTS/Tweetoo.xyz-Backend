import { Notification } from './notification.model'

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.handle
    })

    res.status(200).json(notifications)
  } catch (e) {
    console.error(e)
    res.status(404).send(e)
  }
}

export const updateAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.updateMany(
      { recipient: req.user.handle },
      { ...req.body }
    ).getUpdate()

    res.status(200).json(notifications)
  } catch (e) {
    res.status(404).send('No doc found.')
  }
}

export default { getNotifications, updateAllNotifications }
