import { Router } from 'express'
import controllers from './media.controllers'

const router = Router()

router.route('/user/:handle/:filename').get(controllers.getMedia)

router.route('/tweet/:tweetId/:filename').get(controllers.getMedia)

export default router
