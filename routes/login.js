var express = require('express');
var router = express.Router();
var User = require('../schemes/UserSchema');
var bcrypt = require('bcrypt');
const statuses = require('../utils/statusCodes/ru/status.ru');
const jwt = require('jsonwebtoken');

//FIXME ADD TO .env
const secret = 'mysecretsshhh';

router.post('/', function(req, res) {
  console.log(req.body);
  const { email, password } = req.body;
  User.findOne({ email }, function(err, user) {
    //internal error mongodb when search
    if (err) {
      console.error(err);
      //TODO add error in Mongo
      res.status(500).json({ error: statuses['500'] });
      //user not found
    } else if (!user) {
      res.status(401).json({ error: statuses['401'] });
    } else {
      //user found
      user.isCorrectPassword(password, function(err, same) {
        if (err) {
          res.status(500) .json({ error: statuses['500'] });
        } else if (!same) {
          //password is incorrect
          res.status(401).json({ error: statuses['401']});
        } else {
          //token sign
          const payload = { email };
          const token = jwt.sign(payload, secret, {
            expiresIn: '1h',
          });
          res.cookie('Autorization_token', token, { httpOnly: true })
            .status(200).send(user);
        }
      });
    }
  });
});

module.exports = router;
