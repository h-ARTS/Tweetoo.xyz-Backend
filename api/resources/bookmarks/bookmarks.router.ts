import { Router } from 'express'
import controller from './bookmarks.controller'

const router: Router = Router()

router
  .route('/')
  .get(controller.getBookmarks)
  .post(controller.createBookmark)

export default router
