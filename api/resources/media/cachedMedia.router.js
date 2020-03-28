import { Router } from 'express'
import uploadImage from '../../utils/uploadImage'
import controllers from './media.controllers'
import { assignImagePath } from '../user/user-assets/upload.controller'

const router = Router()

router.post('/:type', uploadImage, controllers.assignCachedImagePath)
router.delete('/', controllers.removeCachedFile, assignImagePath)

export default router
