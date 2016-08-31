const fs        = require('fs');
const path      = require('path');
const Events    = require('../../models/events');
const utils     = require('../../utils');
const _         = require('lodash');
const stringify = require('stringify-object');

const distPath   = path.join(__dirname, '../');
const schemaPath = distPath + '/schemas';

const stringifyOptions = {
  indent:       '  ',
  singleQuotes: true
};

const generateFullSchemas = (eventType) => {
  const eventClass = capitalizeFirstLetter(eventType);
  const eventName  = _.camelCase(eventType);

  console.log(`Building full schemas for eventType: ${eventClass}`);

  const schemas = Events[eventClass].getSchemas();

  cleanAndWriteSchemas(schemas, eventName);
};

const generatePartialSchemas = (eventType) => {
  const eventClass = capitalizeFirstLetter(eventType);
  const eventName  = `auto${eventClass}`;

  console.log(`Building partial schemas for eventType: ${eventClass}`);

  const schemas = Events.partials.auto[eventClass].getSchemas();
  cleanAndWriteSchemas(schemas, eventName);
};

const cleanAndWriteSchemas = (schemas, eventName) => {
  // Remove generated validation
  if (eventName !== Events.Invalid.NAME) {
    delete schemas.validation.properties.visit.properties.generated;
    delete schemas.sanitization.properties.visit.properties.generated;
  }

  // Remove these from the invalid event schemas
  delete schemas.validation.properties.dateReceivedAsInvalid;
  delete schemas.sanitization.properties.dateReceivedAsInvalid;

  fs.writeFileSync(`${schemaPath}/${eventName}.js`, `var utils = require('./utils');${'\n'}module.exports=${stringify(schemas, stringifyOptions)}`);
};

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};


if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath);
}

if (!fs.existsSync(schemaPath)) {
  fs.mkdirSync(schemaPath);
}

// Strip the portions of the schemas that are generated on the backend

const fullEventTypes = [
  'Invalid',
  'AddToCart',
  'Order',
  'Search',
  'SessionChange',
  'ViewProduct'
];

const partialEventTypes = [
  'Search'
];

fs.writeFileSync(`${schemaPath}/utils.js`, `module.exports = ${stringify(_.pick(utils, 'regex'), stringifyOptions)};`);

_.forEach(fullEventTypes, generateFullSchemas);
_.forEach(partialEventTypes, generatePartialSchemas);