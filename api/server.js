import express from 'express'
import morgan from 'morgan'

export const app = express()

app.disable('x-powered-by')

app.use(morgan('dev'))

const port = 3000

export function getAny(req, res) {
  try {
    return res.status(200).send('Hello Express World!')
  } catch (e) {
    console.error(e)
    return res.status(404).end()
  }
}
app.get('/', getAny)

export const start = () => {
  try {
    app.listen(port, () => console.log(`Server listening on Port ${port}!`))
  } catch (e) {
    console.error(e)
  }
}
