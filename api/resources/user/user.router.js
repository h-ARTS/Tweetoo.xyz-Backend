import { Router } from 'express'
import {
  myProfile,
  updateProfile,
  getUser,
  followHandler
} from './user.controllers'
import { upload } from '../../utils/upload'
import { uploadImage } from './image-upload/upload.controller'

const router = Router()

router.get('/', myProfile)
router.put('/', updateProfile)
router.get('/:handle', getUser)
router.put('/:handle', followHandler)
router.post('/image', upload, uploadImage)

export default router
