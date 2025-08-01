const DataPoint = require('../models/DataPoint');

exports.postData = async (req, res, next) => {
  try {
    // app Android não exige auth
    await new DataPoint(req.body).save();
    res.status(201).json({ status: 'ok' });
  } catch (e) {
    next(e);
  }
};

exports.getData = async (req, res, next) => {
  try {
    // only logged-in users
    const { username } = req.user;
    const pts = await DataPoint.find({ username })
      .sort({ timestamp: -1 })
      .limit(500)
      .lean();
    res.json(pts);
  } catch (e) {
    next(e);
  }
};
