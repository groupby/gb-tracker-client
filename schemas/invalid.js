var utils = require('./utils');
module.exports={
  validation: {
    type: 'object',
    properties: {
      eventType: {
        type: 'string'
      },
      eventString: {
        type: 'string',
        optional: true
      },
      customer: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            optional: true
          },
          area: {
            type: 'string',
            optional: true
          }
        },
        optional: true
      }
    }
  },
  sanitization: {
    properties: {
      eventType: {},
      eventString: {},
      customer: {
        properties: {
          id: {},
          area: {}
        }
      }
    }
  }
}