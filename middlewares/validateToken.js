const jwt = require('jsonwebtoken');
//FIXME add token to .env
const secret = 'mysecretsshhh';
const withAuth = function(req, res, next) {
  const token =
    req.body.Autorization_token ||
    req.query.Autorization_token ||
    req.headers['x-access-token'] ||
    req.cookies.Autorization_token;
  if (!token) {
    res.status(401).send('Unauthorized: No token provided');
  } else {
    jwt.verify(token, secret, function(err, decoded) {
      if (err) {
        res.status(401).send({error: 'Unauthorized: Invalid token'});
      } else {
        req.email = decoded.email;
        next();
      }
    });
  }
}
module.exports = withAuth;
