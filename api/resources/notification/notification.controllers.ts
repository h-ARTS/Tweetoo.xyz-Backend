import { Notification, INotification } from './notification.model'
import { IRequestUser } from '../../utils/auth'
import { Response } from 'express'

export const getNotifications = async (
  req: IRequestUser,
  res: Response
): Promise<Response<INotification[]> | void> => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.handle
    })

    res.status(200).json(notifications)
  } catch (e) {
    console.error(e)
    res.status(404).end()
  }
}

export const updateAllNotifications = async (
  req: IRequestUser,
  res: Response
): Promise<Response<INotification[]> | void> => {
  try {
    await Notification.updateMany(
      { recipient: req.user.handle },
      { ...req.body }
    ).exec()
    const notifications = await Notification.find({
      recipient: req.user.handle
    })
      .lean()
      .exec()

    res.status(200).json(notifications)
  } catch (e) {
    res.status(404).send('No doc found.')
  }
}

export default { getNotifications, updateAllNotifications }
