export const apikey = (req, res, next) => {
  const claveRecibida = req.header('x-api-key');

  if (!claveRecibida || claveRecibida !== process.env.API_KEY) {
    return res.status(401).json({
      error: 'API key invalida o ausente',
    });
  }

  next();
};
