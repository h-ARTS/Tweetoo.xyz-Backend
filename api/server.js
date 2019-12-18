import express from 'express'
import morgan from 'morgan'
import { connect } from './utils/db'
import { json, urlencoded } from 'body-parser'
import cors from 'cors'
import config from '../config'
import { authGuard, login, signup } from './utils/auth'
import tweetRouter from './resources/tweet/tweet.router'
import { Tweet } from './resources/tweet/tweet.model'
import { getAll } from './utils/crud'

export const app = express()

app.disable('x-powered-by')

app.use(cors())
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(morgan('dev'))

app.post('/login', login)
app.post('/signup', signup)

app.use('/api', authGuard)
app.use('/api/user', () => {})
app.use('/api/tweet', tweetRouter)
app.use('/api/tweets', getAll(Tweet))
// app.use('/api/tweet/:tweetId/reply', replyRouter)
app.use('/api/notifications', () => {})

export const start = async () => {
  try {
    await connect()
    app.listen(config.port, () =>
      console.log(
        `REST API Server running on  http://localhost:${config.port}/api`
      )
    )
  } catch (e) {
    console.error(e)
  }
}
