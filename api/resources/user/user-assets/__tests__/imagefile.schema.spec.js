import { ImageFileSchema } from '../imagefile.schema'

describe('ImageFileSchema', () => {
  test('has name.', () => {
    const name = ImageFileSchema.obj.name
    expect(name).toEqual({
      type: String,
      required: true
    })
  })
  test('has type.', () => {
    const type = ImageFileSchema.obj.type
    expect(type).toEqual({
      type: String,
      required: true
    })
  })
  test('has url.', () => {
    const url = ImageFileSchema.obj.url
    expect(url).toEqual({
      type: String,
      required: true,
      default: ''
    })
  })
})
