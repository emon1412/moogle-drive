import Config from 'config';

const requiresCorrectOrigin = (req, res, next) => {
  const origin = req.get('origin')
  if (origin === Config.webUrl || origin === Config.localWebUrl) {
    return next();
  }
  return res.status(403)
};

export default requiresCorrectOrigin;
