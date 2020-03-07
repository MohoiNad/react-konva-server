process.env.NODE_ENV = 'test';
const assert = require('chai').assert;
const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const { connectAndDrop, disconnect } = require('../../utils/dbConnect');


chai.use(chaiHttp);

describe('Users', async () => {
  beforeEach(connectAndDrop);
  afterEach(disconnect);

  describe('POST api/registration', () => {

    it('should REGISTER user by email, name and password', (done) => {
      chai.request(server)
        .post('/api/register')
        .send({ password: '123456', name: 'Hellboy', email: 'Hellboy@badman.net' })
        .end((err, res) => {
          expect(res).to.have.cookie('Autorization_token');
          expect(res).to.have.status(200);
          assert.typeOf(res.body, 'object');
          assert.strictEqual(res.body.name, 'hellboy');
          assert.strictEqual(res.body.email, 'hellboy@badman.net');
          assert.strictEqual(res.body.avatar, 'http://s3.amazonaws.com/37assets/svn/765-default-avatar.png');
          done();
        });
    });

    it('should SEND ERROR when register without name', (done) => {
      chai.request(server)
        .post('/api/register')
        .send({ password: '123456', email: 'hellboy@badman.net' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          assert.strictEqual(res.error.text, 'User validation failed: name: Path `name` is required.');
          done(err);
        });
    });

    it('should SEND ERROR when register without password', (done) => {
      chai.request(server)
        .post('/api/register')
        .send({ name: 'Hellboy', email: 'hellboy@badman.net' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          assert.strictEqual(res.error.text, 'User validation failed: password: Path `password` is required.');
          done(err);
        });

    });

    it('should SEND ERROR when register without email', (done) => {
      chai.request(server)
        .post('/api/register')
        .send({ name: 'Hellboy', password: 123456 })
        .end((err, res) => {
          expect(res).to.have.status(400);
          assert.strictEqual(res.error.text, 'User validation failed: email: Path `email` is required.');
          done(err);
        });

    });

    it('should SEND ERROR when register without name and password', (done) => {
      chai.request(server)
        .post('/api/register')
        .send({ email: 'hellboy@badman.net' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          assert.strictEqual(res.error.text, 'User validation failed: name: Path `name` is required., password: Path `password` is required.');
          done(err);
        });

    });

    it('should REGISTER', (done) => {
      chai.request(server)
        .post('/api/register')
        .send({ password: '123456', name: 'Hellboy', email: 'Hellboy@badman.net' })
        .end((err, res) => {
          expect(res).to.have.cookie('Autorization_token');
          expect(res).to.have.status(200);
          assert.typeOf(res.body, 'object');
          assert.strictEqual(res.body.name, 'hellboy');
          assert.strictEqual(res.body.email, 'hellboy@badman.net');
          assert.strictEqual(res.body.avatar, 'http://s3.amazonaws.com/37assets/svn/765-default-avatar.png');
          done(err);
        });

    });

    it('it should SEND ERROR with non unique email', async () => {
      const requester = chai.request(server).keepOpen();
      const res1 = await requester.post('/api/register').send({
        password: '123456',
        name: 'Hellboy',
        email: 'hellboy@badman.net',
      });
      const res2 = await requester.post('/api/register').send({
        password: '123456',
        name: 'Hellboy',
        email: 'hellboy@badman.net',
      });
      assert.strictEqual(res2.statusCode, 400);
      assert.strictEqual(res1.statusCode, 200);
      assert.strictEqual(res2.text, 'User validation failed: email: Error, expected `email` to be unique. Value: `hellboy@badman.net`');
      await requester.close();
    });
  });

  describe('POST api/login', () => {

    it('it give cookie and return user', async () => {
      const requester = chai.request(server).keepOpen();
      const res1 = await requester.post('/api/register').send({
        password: '123456',
        name: 'Hellboy',
        email: 'hellboy@badman.net',
      });
      const res2 = await requester.post('/api/login').send({
        password: '123456',
        email: 'hellboy@badman.net',
      });
      expect(res2).to.have.cookie('Autorization_token');
      expect(res2).to.have.status(200);
      assert.typeOf(res2.body, 'object');
      assert.strictEqual(res2.body.name, 'hellboy');
      assert.strictEqual(res2.body.email, 'hellboy@badman.net');
      assert.strictEqual(res2.body.avatar, 'http://s3.amazonaws.com/37assets/svn/765-default-avatar.png');
      await requester.close();
    });

    it('it give error if user is not exist', async () => {
      const requester = chai.request(server).keepOpen();
      const res1 = await requester.post('/api/login').send({
        password: '123456',
        email: 'hellboy@badman.net',
      });
      expect(res1).to.have.status(401);
      assert.strictEqual(res1.body.error, 'Не авторизован');
      await requester.close();
    });

  });

  describe('GET api/users/:id', async () => {

    it('should SEND user when id exist', async () => {

      const agent = chai.request.agent(server);
      const res1 = await agent.post('/api/register').send({
        password: '123456',
        name: 'Hellboy',
        email: 'hellboy@badman.net',
      });
      const res2 = await agent.get('/api/users/1');
      assert.strictEqual(res1.statusCode, 200);
      expect(res1).to.have.cookie('Autorization_token');
      assert.strictEqual(res2.statusCode, 200);
      assert.typeOf(res2.body, 'object');
      assert.strictEqual(res2.body.name, 'hellboy');
      assert.strictEqual(res2.body.id, 1);
      assert.strictEqual(res2.body.email, 'hellboy@badman.net');
      assert.strictEqual(res2.body.avatar, 'http://s3.amazonaws.com/37assets/svn/765-default-avatar.png');
    });

    it('should message when id not exist', async () => {
      const agent = chai.request.agent(server);
      const res1 = await agent.post('/api/register').send({
        password: '123456',
        name: 'Hellboy',
        email: 'hellboy@badman.net',
      });
      const res2 = await agent.get('/api/users/5');
      assert.strictEqual(res1.statusCode, 200);
      expect(res1).to.have.cookie('Autorization_token');
      assert.strictEqual(res2.statusCode, 404);
      assert.strictEqual(res2.body.error, 'User not found');
    });

    it('should send 401 when token not provided', async () => {
      const agent = chai.request.agent(server);
      const res1 = await agent.get('/api/users/5');
      assert.strictEqual(res1.statusCode, 401);
      assert.strictEqual(res1.text, 'Unauthorized: No token provided');
    });

  });

  describe('PUT api/users:id', () => {

    it('should EDIT user when id exist', async () => {
      const agent = chai.request.agent(server);
      const res1 = await agent.post('/api/register').send({
        password: '123456',
        name: 'Hellboy',
        email: 'hellboy@badman.net',
      });
      const res2 = await agent.put('/api/users/1').send({
        password: '1222456',
        name: 'Jellboy',
        email: 'helGboyz@badman.net',
      });
      assert.strictEqual(res1.statusCode, 200);
      expect(res1).to.have.cookie('Autorization_token');
      assert.strictEqual(res2.statusCode, 200);
      assert.strictEqual(res2.body.name, 'jellboy');
      assert.strictEqual(res2.body.id, '1');
      assert.strictEqual(res2.body.email, 'helgboyz@badman.net');
      assert.strictEqual(res2.body.avatar, 'http://s3.amazonaws.com/37assets/svn/765-default-avatar.png');
    });

    it('should return 404 when id is not exist', async () => {
      const agent = chai.request.agent(server);
          const res1 = await agent.post('/api/register').send({
            password: '123456',
            name: 'Hellboy',
            email: 'hellboy@badman.net',
          });
          const res2 = await agent.put('/api/users/4').send({
            password: '1222456',
            name: 'Jellboy',
            email: 'helGboyz@badman.net',
          });
          assert.strictEqual(res1.statusCode, 200);
          expect(res1).to.have.cookie('Autorization_token');
          assert.strictEqual(res2.statusCode, 404);
    });

    it('should send 401 when token not provided', async () => {
        const agent = chai.request.agent(server);
        const res1 = await agent.put('/api/users/1');
        assert.strictEqual(res1.statusCode, 401);
        assert.strictEqual(res1.text, 'Unauthorized: No token provided');
      });
  });

  describe('DELETE api/users:id', () => {

    it('should DELETE user when id exist', async () => {
      const agent = chai.request.agent(server);
      const res1 = await agent.post('/api/register').send({
        password: '123456',
        name: 'Hellboy',
        email: 'hellboy@badman.net',
      });
      const res2 = await agent.delete('/api/users/1').send({
        password: '1222456',
        name: 'Jellboy',
        email: 'helGboyz@badman.net',
      });
      assert.strictEqual(res1.statusCode, 200);
      expect(res1).to.have.cookie('Autorization_token');
      assert.strictEqual(res2.statusCode, 410);
      assert.strictEqual(res2.body.message, 'User deleted');
    });

    it('should send error when user id not exist', async () => {
      const agent = chai.request.agent(server);
      const res1 = await agent.post('/api/register').send({
        password: '123456',
        name: 'Hellboy',
        email: 'hellboy@badman.net',
      });
      const res2 = await agent.delete('/api/users/6').send({
        password: '1222456',
        name: 'Jellboy',
        email: 'helGboyz@badman.net',
      });
      assert.strictEqual(res1.statusCode, 200);
      expect(res1).to.have.cookie('Autorization_token');
      assert.strictEqual(res2.statusCode, 404);
      assert.strictEqual(res2.body.error, 'User not found');
    });

  });

  describe('POST api/dashboard', () => {

    it('should enter if user have token', async () => {
      const agent = chai.request.agent(server);
      const res1 = await agent.post('/api/register').send({
        password: '123456',
        name: 'Hellboy',
        email: 'hellboy@badman.net',
      });
      const res2 = await agent.get('/api/dashboard');
      assert.strictEqual(res1.statusCode, 200);
      expect(res1).to.have.cookie('Autorization_token');
      assert.strictEqual(res2.statusCode, 200);
      assert.strictEqual(res2.body.message, 'Oh, baby you are authorize!');
    });



      it('should send 401 when token not provided', async () => {
          const agent = chai.request.agent(server);
          const res1 = await agent.get('/api/dashboard');
          assert.strictEqual(res1.statusCode, 401);
          assert.strictEqual(res1.text, 'Unauthorized: No token provided');
        });


  });

});
