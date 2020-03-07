var express = require('express');
var router = express.Router();
var User = require('../schemes/UserSchema');
var bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


//FIXME ADD TO .env
const secret = 'mysecretsshhh';
//For production build recommended more than 12
const salt = 2;

router.post('/', function(req, res) {

  const {name, email, password} = req.body;
      const user = new User({ name, email, password });
      user.save((err, user) => {
        if(err){
          res.status(400).send(err.message)
        }
       else {
        const payload = { payload: email };
        const token = jwt.sign(payload, secret, {
          expiresIn: '1h',
        });
        res.cookie('Autorization_token', token, { httpOnly: true })
          .status(200).send(user.toJSON());
      }
      });

});

module.exports = router;
