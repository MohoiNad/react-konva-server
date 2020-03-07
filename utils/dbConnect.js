/**
 * @params config()
 */


const mongoose = require('mongoose');
const databaseUrl = 'mongodb://localhost:27017/backend';
mongoose.Promise = global.Promise;


const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,

};
const connect = async () => {
  mongoose.connect(databaseUrl, options);

  mongoose.connection
    //.once('open', () => console.log('Success: connected to ' + databaseUrl))
    .on('error', (error) => {
      console.error('MongoDB error: ' + error.message);
      console.error('Make sure a mongoDB server is running and accessible by this application');
    });
};
const runWithDatabase = async (runWhileConnected) => {
  console.log('connecting to database...\n');
  await mongoose.connect(databaseUrl, options);

  console.log('dropping old data...\n');
  await mongoose.connection.db.dropDatabase();

  console.log('running function...\n');
  await runWhileConnected();

  console.log('\n');

  console.log('disconnecting from database...\n');
  await mongoose.disconnect();
  console.log('complete!\n');
};
const connectAndDrop = async () => {
  await mongoose.connect(databaseUrl, options);
  mongoose.connection
    //.once('open', () => console.log('Success: connected to ' + databaseUrl))
    .on('error', (error) => {
      console.warn('Error : ', error);
    });
  await mongoose.connection.db.dropDatabase();
};
const getCollections = async () => {
  await mongoose.connect(databaseUrl, options);
  await mongoose.connection.db.listCollections().toArray(function(err, names) {
    if (err) {
      console.log(err);
    } else {
      console.log(names);
    }
  });
};
const disconnect = async () => {
  /**
   * Disconnect
   * @constructor  mongoose.disconnect
   */
  await mongoose.disconnect();
};

module.exports = {
  runWithDatabase,
  connect,
  getCollections,
  connectAndDrop,
  disconnect,
  mongoose,
  databaseUrl,
  options,
};

