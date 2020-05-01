import { Router } from 'express'
import { getEntries } from './search.controllers'

const router: Router = Router()

router.route('/').get(getEntries)

export default router
