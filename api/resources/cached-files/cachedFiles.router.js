import { Router } from 'express'
import { assignCachedImagePath } from './cachedFiles.controller'
import uploadImage from '../../utils/uploadImage'

const router = Router()

router.route('/:type').post(uploadImage, assignCachedImagePath)

export default router
