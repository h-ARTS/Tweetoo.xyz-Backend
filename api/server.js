import express from 'express'
import morgan from 'morgan'
import { connect } from './utils/db'
import { json, urlencoded } from 'body-parser'
import cors from 'cors'
import config from '../config'
import { authGuard, login, signup } from './utils/auth'

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
app.use('/api/tweet', () => {})
app.use('/api/tweets', () => {})
app.use('/api/notifications', () => {})

export const start = async () => {
  try {
    await connect()
    app.listen(config.port, () =>
      console.log(`Server listening on Port ${config.port}!`)
    )
  } catch (e) {
    console.error(e)
  }
}
