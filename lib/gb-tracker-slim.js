const Tracker = require('./gb-tracker-core');

const SCHEMAS = {
  addToCart:           require('../schemas/addToCart-validate'),
  viewCart:            require('../schemas/viewCart-validate'),
  removeFromCart:      require('../schemas/removeFromCart-validate'),
  order:               require('../schemas/order-validate'),
  autoSearch:          require('../schemas/autoSearch-validate'),
  autoMoreRefinements: require('../schemas/autoMoreRefinements-validate'),
  search:              require('../schemas/search-validate'),
  sessionChange:       require('../schemas/sessionChange-validate'),
  viewProduct:         require('../schemas/viewProduct-validate')
};

/**
 * Based on the schema provided, sanitize the event
 * @param event
 * @param schemas
 */
const sanitizeEvent = (event) => {
  if (event.search && event.search.query) {
    event.search.query = event.search.query.replace(/<|>/g, '').trim();
  }
};

module.exports = Tracker(SCHEMAS, sanitizeEvent);
