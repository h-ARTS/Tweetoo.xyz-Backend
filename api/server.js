import express from 'express'
import morgan from 'morgan'
import config from '../config'
import { connect } from './utils/db'

export const app = express()

app.disable('x-powered-by')

app.use(morgan('dev'))

export function getAny(req, res) {
  try {
    return res.status(200).send('Hello Express World!')
  } catch (e) {
    console.error(e)
    return res.status(404).end()
  }
}
app.get('/', getAny)

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
