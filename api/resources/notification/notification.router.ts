import { Router } from 'express'
import controllers from './notification.controllers'

const router: Router = Router()

router
  .route('/')
  .get(controllers.getNotifications)
  .put(controllers.updateAllNotifications)

export default router
