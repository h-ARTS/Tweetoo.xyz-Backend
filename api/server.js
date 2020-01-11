import express from 'express'
import morgan from 'morgan'
import { connect } from './utils/db'
import { json, urlencoded } from 'body-parser'
import cors from 'cors'
import config from '../config'
import { authGuard, login, signup, logout } from './utils/auth'
import { Tweet } from './resources/tweet/tweet.model'
import tweetRouter from './resources/tweet/tweet.router'
import replyRouter from './resources/reply/reply.router'
import userRouter from './resources/user/user.router'
import { getAll } from './utils/crud'
import { Reply } from './resources/reply/reply.model'

export const app = express()

app.disable('x-powered-by')

app.use(cors())
app.use('/media', express.static('media'))
app.use(morgan('dev'))
app.use(json())
app.use(urlencoded({ extended: true }))

app.post('/login', login)
app.post('/signup', signup)
app.post('/logout', logout)

app.use('/api', authGuard)
app.use('/api/user', userRouter)
app.use('/api/tweet', tweetRouter)
app.use('/api/tweets', getAll(Tweet))
app.use('/api/reply', replyRouter)
app.use('/api/replies', getAll(Reply))
app.use('/api/notifications', () => {})

export const start = async () => {
  try {
    await connect()
    app.listen(config.port, () =>
      console.log(
        `REST API Server running on http://localhost:${config.port}/api`
      )
    )
  } catch (e) {
    console.error(e)
  }
}

app.use(function(err, req, res, next) {
  console.log('This is the invalid field -> ', err.field)
  next(err)
})
