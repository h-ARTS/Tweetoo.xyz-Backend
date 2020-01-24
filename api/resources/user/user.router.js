import { Router } from 'express'
import {
  myProfile,
  updateProfile,
  getUser,
  followHandler,
  deleteProfile
} from './user.controllers'
import { upload } from '../../utils/upload'
import { uploadImage } from './user-uploads/upload.controller'
import checkUserDir from './user-uploads/checkUserDir'

const router = Router()

router.get('/', myProfile)
router.put('/', updateProfile)
router.delete('/', checkUserDir, deleteProfile)
router.get('/:handle', getUser)
router.put('/:handle', followHandler)
router.post('/image', upload, uploadImage)

export default router
