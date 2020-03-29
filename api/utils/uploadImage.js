import fs from 'fs'
import multer from 'multer'

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const targetPath =
      !req.params || req.params.handle !== ''
        ? req.params.type === 'newuser'
          ? './media/cached/'
          : `./media/user/${req.params.handle}/`
        : `./media/tweet/${req.params.tweetId}/`
    return fs.mkdir(targetPath, { recursive: true }, () => {
      cb(null, targetPath)
    })
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/gif' ||
    file.mimetype === 'image/webp'
  ) {
    console.log(file)
    return cb(null, true)
  } else {
    return cb(
      new Error(`File type ${file.mimetype} not allowed to upload.`),
      false
    )
  }
}

export default multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 7
  },
  preservePath: true,
  fileFilter: fileFilter
}).single('image')
