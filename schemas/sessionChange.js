var utils = require('./utils');
module.exports={
  validation: {
    type: 'object',
    properties: {
      eventType: {
        type: 'string'
      },
      customer: {
        type: 'object',
        properties: {
          id: {
            type: 'string'
          },
          area: {
            type: 'string',
            optional: false
          }
        },
        strict: true
      },
      session: {
        type: 'object',
        properties: {
          previousSessionId: {
            type: 'string',
            optional: true
          },
          newSessionId: {
            type: 'string'
          },
          previousVisitorId: {
            type: 'string',
            optional: true
          },
          newVisitorId: {
            type: 'string'
          }
        },
        strict: true
      },
      visit: {
        type: 'object',
        properties: {
          customerData: {
            type: 'object',
            properties: {
              visitorId: {
                type: 'string'
              },
              sessionId: {
                type: 'string'
              }
            },
            strict: true
          }
        },
        strict: true
      },
      metadata: {
        optional: true,
        strict: true,
        properties: {
          '*': {
            type: 'string'
          }
        }
      }
    },
    strict: true
  },
  sanitization: {
    properties: {
      eventType: {},
      customer: {
        properties: {
          id: {},
          area: {
            optional: false,
            def: 'default'
          }
        },
        strict: true
      },
      session: {
        properties: {
          previousSessionId: {
            optional: true
          },
          newSessionId: {},
          previousVisitorId: {
            optional: true
          },
          newVisitorId: {}
        },
        strict: true
      },
      visit: {
        properties: {
          customerData: {
            properties: {
              visitorId: {},
              sessionId: {}
            },
            strict: true
          }
        },
        strict: true
      },
      metadata: {}
    },
    strict: true
  }
}