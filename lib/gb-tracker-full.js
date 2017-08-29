const inspector = require('schema-inspector');
const Tracker = require('./gb-tracker-core');

const SCHEMAS = {
  addToCart:           require('../schemas/addToCart'),
  viewCart:            require('../schemas/viewCart'),
  removeFromCart:      require('../schemas/removeFromCart'),
  order:               require('../schemas/order'),
  autoSearch:          require('../schemas/autoSearch'),
  autoMoreRefinements: require('../schemas/autoMoreRefinements'),
  search:              require('../schemas/search'),
  sessionChange:       require('../schemas/sessionChange'),
  viewProduct:         require('../schemas/viewProduct')
};

/**
 * Based on the schema provided, sanitize the event
 * @param event
 * @param schemas
 */
const sanitizeEvent = (event, schemas) =>
  inspector.sanitize(schemas.sanitization, event);

module.exports = Tracker(SCHEMAS, sanitizeEvent);
