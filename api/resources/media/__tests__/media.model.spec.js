import { Media } from '../media.model'

describe('Media model:', () => {
  test('has path', () => {
    const path = Media.schema.obj.path
    expect(path).toEqual({
      type: String,
      required: true
    })
  })

  test('has originalname', () => {
    const originalname = Media.schema.obj.originalname
    expect(originalname).toEqual({
      type: String,
      required: true
    })
  })

  test('has mimetype', () => {
    const mimetype = Media.schema.obj.mimetype
    expect(mimetype).toEqual({
      type: String,
      required: true
    })
  })

  test('has handle', () => {
    const handle = Media.schema.obj.handle
    expect(handle).toEqual({
      type: String,
      required: true
    })
  })
})
