const fs       = require('fs');
const path     = require('path');
const Events   = require('../../common/models/events');
const gulpUtil = require('gulp-util');
const _        = require('lodash');

const distPath         = path.join(__dirname, '../');
const schemaPath       = distPath + '/schemas';
const validationPath   = schemaPath + '/validation';
const sanitizationPath = schemaPath + '/sanitization';

const generateSchemas = (eventType) => {
  const eventClass = capitalizeFirstLetter(eventType);
  const eventName  = _.camelCase(eventType);

  gulpUtil.log(`Building schemas for eventType: ${eventClass}`);

  const schemas = Events[eventClass].getSchemas();

  // Remove generated validation
  if (eventName !== Events.Invalid.NAME) {
    delete schemas.validation.properties.visit.properties.generated;
    delete schemas.sanitization.properties.visit.properties.generated;
  }

  // Remove these from the invalid event schemas
  delete schemas.validation.properties.dateReceivedAsInvalid;
  delete schemas.sanitization.properties.dateReceivedAsInvalid;

  fs.writeFileSync(`${validationPath}/${eventName}.json`, JSON.stringify(schemas.validation, null, 2));
  fs.writeFileSync(`${sanitizationPath}/${eventName}.json`, JSON.stringify(schemas.sanitization, null, 2));
};

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

module.exports = () => {
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath);
  }

  if (!fs.existsSync(schemaPath)) {
    fs.mkdirSync(schemaPath);
  }

  if (!fs.existsSync(validationPath)) {
    fs.mkdirSync(validationPath);
  }

  if (!fs.existsSync(sanitizationPath)) {
    fs.mkdirSync(sanitizationPath);
  }

// Strip the portions of the schemas that are generated on the backend

  const eventTypes = [
    'Invalid',
    'AddToBasket',
    'Navigation',
    'Order',
    'SearchWithId',
    'SearchWithoutId',
    'SessionChange',
    'ViewProduct'
  ];

  _.forEach(eventTypes, generateSchemas);
};