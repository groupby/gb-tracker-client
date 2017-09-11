const Tracker = require('./gb-tracker-core');

const SCHEMAS = {
  addToCart: require('../schemas/addToCart-validate'),
  viewCart: require('../schemas/viewCart-validate'),
  removeFromCart: require('../schemas/removeFromCart-validate'),
  order: require('../schemas/order-validate'),
  autoSearch: require('../schemas/autoSearch-validate'),
  autoMoreRefinements: require('../schemas/autoMoreRefinements-validate'),
  search: require('../schemas/search-validate'),
  sessionChange: require('../schemas/sessionChange-validate'),
  viewProduct: require('../schemas/viewProduct-validate')
};

/**
 * Based on the schema provided, sanitize the event
 * @param event
 * @param schemas
 */
const sanitizeEvent = (event) => {
  if (event.search) {
    const origin = {
      sayt: false,
      dym: false,
      search: false,
      recommendations: false,
      autosearch: false,
      navigation: false,
      collectionSwitcher: false
    };

    if (event.search.origin) {
      for (const key of Object.keys(event.search.origin)) {
        origin[key] = event.search.origin[key];
      }
    }
    event.search.origin = origin;

    if (event.search.query) {
      event.search.query = event.search.query.replace(/<|>/g, '').trim();
    }
  }

  if (event.product && event.product.price && typeof event.product.price !== 'number') {
    event.product.price = Number(event.product.price);
  }
};

module.exports = Tracker(SCHEMAS, sanitizeEvent);
