import * as express from 'express'
import * as morgan from 'morgan'
import { connect } from './utils/db'
import { json, urlencoded } from 'body-parser'
import * as cors from 'cors'
import config from '../config'
import { authGuard, login, signup, logout } from './utils/auth'
import initNotificationEmitter from './utils/notificationEmitter'

import { getUsers } from './resources/user/user.controllers'
import { getAll } from './utils/crud'
import { Tweet } from './resources/tweet/tweet.model'
import { Reply } from './resources/reply/reply.model'
import tweetRouter from './resources/tweet/tweet.router'
import replyRouter from './resources/reply/reply.router'
import userRouter from './resources/user/user.router'
import mediaRouter from './resources/media/media.router'
import notificationRouter from './resources/notification/notification.router'
import bookmarksRouter from './resources/bookmarks/bookmarks.router'
import searchRouter from './resources/search/search.router'

export const app: express.Express = express()

app.disable('x-powered-by')
// Middlewares
app.use(cors())
app.use('/media', express.static('media'))
app.use(morgan('dev'))
app.use(json())
app.use(urlencoded({ extended: true }))

// Auth route
app.post('/login', login)
app.post('/signup', signup)
app.post('/logout', logout)
// API
app.use('/api', authGuard)
app.use('/api/user', userRouter)
app.use('/api/users', getUsers)
app.use('/api/tweet', tweetRouter)
app.use('/api/tweets', getAll(Tweet))
app.use('/api/reply', replyRouter)
app.use('/api/replies', getAll(Reply))
app.use('/api/notifications', notificationRouter)
app.use('/api/bookmarks', bookmarksRouter)
app.use('/api/search', searchRouter)
// Assets route
app.use('/media', mediaRouter)

export const start = async (): Promise<any> => {
  try {
    initNotificationEmitter()
    await connect()
    app.listen(config.port, (): void =>
      console.log(`REST API Server running on http://localhost:${config.port}/api`)
    )
  } catch (e) {
    console.error(e)
  }
}

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
  console.log('This is the invalid field -> ', err.field)
  next(err)
})
