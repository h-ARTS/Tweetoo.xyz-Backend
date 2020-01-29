import fs from 'fs'

export const getMedia = (req, res) => {
  const { filename, tweetId, handle } = req.params
  if (!!tweetId && fs.existsSync(`media/tweet/${tweetId}/${filename}`)) {
    return res.status(200).sendFile(`/media/tweet/${tweetId}/${filename}`)
  } else if (!!handle && fs.existsSync(`media/user/${handle}/${filename}`)) {
    return res.status(200).sendFile(`/media/user/${handle}/${filename}`)
  } else {
    return res.status(404).end()
  }
}

export default { getMedia }
