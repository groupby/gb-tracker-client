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
      eventType: {
        rules: [
          'trim',
          'lower'
        ]
      },
      eventString: {
        rules: [
          'trim',
          'lower'
        ]
      },
      customer: {
        properties: {
          id: {
            rules: [
              'trim',
              'lower'
            ]
          },
          area: {
            rules: [
              'trim',
              'lower'
            ]
          }
        }
      }
    }
  }
}