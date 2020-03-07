const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const autoIncrementModelID = require('./counterModel');


//For production build recomended more than 12
const salt = 2;

const UserSchema = new Schema({
    id: { type: Number, unique: true, min: 1 },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    avatar: { type: String, default: 'http://s3.amazonaws.com/37assets/svn/765-default-avatar.png' },
  },
  {
    autoIndex: true,
    timestamps: true,
  });

UserSchema.methods.isCorrectPassword = function(password, callback) {
  bcrypt.compare(password, this.password, function(err, same) {
    if (err) {
      callback(err);
    } else {
      callback(err, same);
    }
  });
};
UserSchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj.password;
  delete obj._id;
  delete obj.__v;
  return obj;
};
UserSchema.plugin(uniqueValidator);
UserSchema.pre('save', function(next) {
  if (!this.isNew) {
    next();
  }
  autoIncrementModelID('activities', this, next);
});
UserSchema.pre('save', function(next) {
  if (5 >= this.password.length) {
    const err = new Error('Password must be more or equal or more than 6 characters');
    next(err);
  }
  next();
});
UserSchema.pre('save', async function(next) {
  try {
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next();
  } catch (e) {
    next(e);
  }
});

UserSchema.pre('findOneAndUpdate', async function(next) {
  const user = this.getUpdate();

  if( typeof user.password !== 'undefined') {
      console.log( user.password)
    if (5 >= user.password.length) {
      const err = new Error('Password must be more or equal or more than 6 characters');
      next(err);
    }
    try {
      const hash = await bcrypt.hash(user.password, salt);
      user.password = hash;
      next();
    } catch (e) {
      next(e);
    }
    next()
  }

});

UserSchema.pre('findOneAndUpdate', function(next){
 const user = this.getUpdate();
 if(user.name) user.name = user.name.toLowerCase();
  if(user.email) user.email = user.email.toLowerCase();
  next();
})


UserSchema.pre('save', function(next) {
  this.name = this.name.toLowerCase();
  this.email = this.email.toLowerCase();
  next();
});


module.exports = mongoose.model('User', UserSchema);

