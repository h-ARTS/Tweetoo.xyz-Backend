import { ImageFileSchema } from '../imagefile.schema'

describe('ImageFileSchema', () => {
  test('has name.', () => {
    const name = ImageFileSchema.obj.name
    expect(name).toEqual({
      type: String,
      required: true,
      default: 'no_cover.js'
    })
  })
  test('has type.', () => {
    const type = ImageFileSchema.obj.type
    expect(type).toEqual({
      type: String,
      required: true,
      default: 'image/jpeg'
    })
  })
  test('has url.', () => {
    const url = ImageFileSchema.obj.url
    expect(url).toEqual({
      type: String,
      required: true,
      default: 'media/standard/no_cover.js'
    })
  })
  test('has mediaId.', () => {
    const mediaId = ImageFileSchema.obj.mediaId
    expect(mediaId).toEqual({
      type: String,
      required: false
    })
  })
})
