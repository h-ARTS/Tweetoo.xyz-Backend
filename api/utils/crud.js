export const getAll = model => async (req, res) => {
  try {
    const docs = await model
      .find()
      .limit(10)
      .lean()
      .exec()

    return res.status(200).json({ data: docs })
  } catch (e) {
    console.error(e)
    return res.status(400).end()
  }
}

export const getOne = model => async (req, res) => {
  try {
    const doc = await model
      .findOne(req.body)
      .lean()
      .exec()

    return res.status(200).json({ data: doc })
  } catch (e) {
    console.error(e)
    return res.status(400).end()
  }
}

export const createOne = model => async (req, res) => {
  const userBody = {
    userId: req.user._id,
    fullName: req.user.fullName,
    handle: req.user.handle
  }
  try {
    const doc = await model.create({ ...req.body, ...userBody })

    return res.status(200).json({ data: doc })
  } catch (e) {
    console.error(e)
    return res.status(400).end()
  }
}

export const updateOne = model => async (req, res) => {
  try {
    const updatedDoc = await model
      .findOneAndUpdate(
        {
          userId: req.user._id,
          _id: req.params.tweetId
        },
        req.body,
        { new: true }
      )
      .lean()
      .exec()

    if (!updatedDoc) {
      return res.status(400).send({ message: 'Nothing new can be updated' })
    }

    return res.status(200).json({ data: updatedDoc })
  } catch (e) {
    console.error(e)
    return res.status(400).end()
  }
}

export const removeOne = model => async (req, res) => {
  try {
    const removedDoc = await model.findOneAndRemove({
      userId: req.user._id,
      _id: req.params.tweetId
    })

    if (!removedDoc) {
      return res.status(400).send({ message: 'Not found for removal' })
    }

    return res.status(200).json({ data: removedDoc })
  } catch (e) {
    console.error(e)
    return res.status(400).end()
  }
}

export const controllers = model => {
  return {
    getAll: getAll(model),
    getOne: getOne(model),
    createOne: createOne(model),
    updateOne: updateOne(model),
    removeOne: removeOne(model)
  }
}
