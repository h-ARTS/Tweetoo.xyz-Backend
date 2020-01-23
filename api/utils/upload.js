import multer from 'multer'
import fs from 'fs'

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const targetPath = `./media/${req.user.handle}/`
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
    return cb(null, true)
  } else {
    return cb(
      new Error(`File type ${file.mimetype} not allowed to upload.`),
      false
    )
  }
}

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 7
  },
  preservePath: true,
  fileFilter: fileFilter
}).single('image')
