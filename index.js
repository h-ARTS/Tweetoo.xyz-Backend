const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.status(200)
  res.send('Hello Express World!')
})

app.listen(port, () => console.log(`Server listening on Port ${port}!`))