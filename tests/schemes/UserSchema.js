const User = require('../../schemes/UserSchema');
const { assert } = require('chai');
const { connectAndDrop, disconnect } = require('../../utils/dbConnect');


describe('UserSchema', () => {

  beforeEach(connectAndDrop);
  afterEach(disconnect);

  describe('#name', () => {

    it('is required', () => {
      const user = new User({
        email: 'rand@google.com',
        password: '123456',
      });
      const error = user.validateSync();
      assert.equal(error.errors.name.message, 'Path `name` is required.');
      assert.equal(error.errors.name.kind, 'required');
    });

    it('is lower case after save', (done) => {
      const user = new User({
        password: '123456',
        name: 'UsEr',
        email: 'rand@google.com',
      });

      user.save((err, user) => {
        assert.deepEqual(user.name, 'user');
        done(err);
      });
    });

  });

  describe('#email', () => {
    it('is required', () => {
      const user = new User({
        password: '123456',
        name: 'user',
      });
      const error = user.validateSync();
      assert.equal(error.errors.email.message, 'Path `email` is required.');
      assert.equal(error.errors.email.kind, 'required');
    });
    it('is lower case after save', (done) => {
      const user = new User({
        password: '123456',
        name: 'user',
        email: 'Rand@Google.com',
      });

      user.save((err, user) => {
        assert.deepEqual(user.email, 'rand@google.com');
        done(err);
      });

    });
  });

  describe('#password', () => {
    it('is required', () => {
      const user = new User({
        email: 'rand@google.com',
        name: 'user',
      });
      const error = user.validateSync();
      assert.equal(error.errors.password.message, 'Path `password` is required.');
      assert.equal(error.errors.password.kind, 'required');
    });
    it('is more than 5 character', (done) => {
      const user = new User({
        email: 'random@google.com',
        name: 'users',
        password: '12345',
      });
      user.save((err, user) => {
        assert.deepEqual(err.message, 'Password must be more or equal or more than 6 characters');
        done();
      });
    });
  });

  describe('#avatar', () => {
    it('saving successfully', () => {
      const user = new User({
        name: 'Hellboy',
        email: 'rand@google.com',
        password: '123456',
        avatar: 'http://www.kasparov.ru/content/materials/201904/5CB5E143D1F14.jpg',
      });

      assert.strictEqual(user.avatar, 'http://www.kasparov.ru/content/materials/201904/5CB5E143D1F14.jpg');
    });
    it('have default value', () => {
      const user = new User({
        name: 'Hellboy',
        password: '123456',
      });

      assert.strictEqual(user.avatar, 'http://s3.amazonaws.com/37assets/svn/765-default-avatar.png');
    });
    it('can change default value', () => {
      const user = new User({
        name: 'Hellboy',
        password: '123456',
        avatar: 'http://www.kasparov.ru/content/materials/201904/5CB5E143D1F14.jpg',
      });

      assert.strictEqual(user.avatar, 'http://www.kasparov.ru/content/materials/201904/5CB5E143D1F14.jpg');
    });
  });

  describe('methods', () => {
    it('password would become hash after update user', async () => {
      const user = new User({
        name: 'Hellboy',
        email: 'rand@google.com',
        password: '123456',
        avatar: 'http://www.kasparov.ru/content/materials/201904/5CB5E143D1F14.jpg',
      });
      await user.save();
      const filter = { name: 'hellboy' };
      const update = {
        name: 'Jellboy',
        email: 'rand@google.com',
        password: '123456',
        avatar: 'http://www.kasparov.ru/content/materials/201904/5CB5E143D1F14.jpg',
      };
      const options = { new: true };
      const documentCount = await User.countDocuments(filter);
      //console.log(documentCount);
      const updatedUser = await User.findOneAndUpdate(filter, update, options);
      assert.strictEqual(updatedUser.name, 'jellboy');
    });
    it('password must be more or equal or more than 6 characters', async () => {
      const user = new User({
        name: 'Hellboy',
        email: 'rand@google.com',
        password: '123456',
        avatar: 'http://www.kasparov.ru/content/materials/201904/5CB5E143D1F14.jpg',
      });
      await user.save();
      const filter = { name: 'hellboy' };
      const update = {
        name: 'Jellboy',
        email: 'rand@google.com',
        password: '12345',
        avatar: 'http://www.kasparov.ru/content/materials/201904/5CB5E143D1F14.jpg',
      };
      const options = { new: true };
      try {
        const updatedUser = await User.findOneAndUpdate(filter, update, options, (err) => {
        });
      } catch (error) {
        assert.equal(error.message, 'Password must be more or equal or more than 6 characters');
      }
    });
  });
});
