var express = require('express');
var router = express.Router();
var User = require('../schemes/UserSchema');
var bcrypt = require('bcrypt');
const validateToken = require('../middlewares/validateToken');
const jwt = require('jsonwebtoken');

//For production build recomended more than 12
const salt = 2;

//FIXME ADD TO .env
const secret = 'mysecretsshhh';


router.get('/', validateToken, async function(req, res, next) {
  console.log(req.query.page);
  if (!req.query) {
    res.status(400).send({ message: `'page' parameter is not provided in query` });
  } else {
    var limit = 6;

    const total = await User.collection.estimatedDocumentCount();
    res.status(200).send({
      'page': req.query.page,
      'per_page': limit,
      'total': total,
      'total_pages': Math.ceil(total / limit),
      'data': await User.find({}).limit(limit).skip(limit * (req.query.page - 1)),
    });
  }
});

router.get('/:id', validateToken, function(req, res, next) {

  User.findOne({ id: req.params.id })
    .then(function(user) {
      if (user) {
        const { id, name, email, avatar } = user;
        res.status(200).send({ id, name, email, avatar });
      } else {
        res.status(404).send({ error: 'User not found' });
      }
    });
});

router.put('/:id', validateToken, async function(req, res, next) {
  const id = req.params.id;
  const { name, email, password } = req.body;
  const filter = { id: req.params.id };
  const update = { name, email, password };
  const options = { new: true };
  const user = await User.findOneAndUpdate(filter, update, options);
  if (user) {
    res.status(200).send({ id, name: user.name, email: user.email, avatar: user.avatar });
  } else {
    res.status(404).send({ error: 'User not found' });
  }
});

router.delete('/:id', validateToken, async function(req, res, next) {
  const user = await User.findOneAndRemove({ id: req.params.id }).exec();
  if (user) {
    console.log(user);
    res.status(410).send({ message: 'User deleted' });
  } else {
    res.status(404).send({ error: 'User not found' });
  }
});

module.exports = router;
