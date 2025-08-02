const DataPoint = require('../models/DataPoint');

exports.postData = async (req, res, next) => {
  try {
    await new DataPoint(req.body).save();
    res.status(201).json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
};

exports.getData = async (req, res, next) => {
  try {
    const { username } = req.user;
    const points = await DataPoint.find({ username })
      .sort({ timestamp: -1 })
      .limit(500)
      .lean();
    res.json(points);
  } catch (e) {
    next(e);
  }
};
