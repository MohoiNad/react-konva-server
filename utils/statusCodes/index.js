const facts = require('./internal/funnyFacts');
const contacts = require('./contacts');
const statuses = require('./ru/status.ru');

function getRandomFacts(){
  const randomNumberFromArrayLength = Math.floor(Math.random() * Math.floor(facts.length));
  return facts[randomNumberFromArrayLength];
}

function get500Code(){
  if (contacts['email'] !== undefined){
    return statuses['500'] + " " +(contacts['email'])
  }
  else return(statuses['500'].slice(-1))
}
module.exports = {getRandomFacts, get500Code};
