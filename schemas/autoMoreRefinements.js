var utils = require('./utils');
module.exports={
  type: 'object',
  properties: {
    clientVersion: {
      type: 'object',
      properties: {
        raw: {
          type: 'string'
        },
        major: {
          type: 'integer',
          optional: true
        },
        minor: {
          type: 'integer',
          optional: true
        },
        patch: {
          type: 'integer',
          optional: true
        },
        prerelease: {
          type: 'array',
          items: {
            type: 'string'
          },
          optional: true
        },
        build: {
          type: 'array',
          items: {
            type: 'string'
          },
          optional: true
        },
        version: {
          type: 'string',
          optional: true
        }
      },
      strict: true
    },
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
    moreRefinements: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          minLength: 1,
          optional: false
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
            },
            loginId: {
              type: 'string',
              optional: true
            }
          },
          strict: true
        }
      },
      strict: true
    },
    metadata: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          key: {
            type: 'string'
          },
          value: {
            type: 'string'
          }
        },
        strict: true
      },
      optional: true
    }
  },
  strict: true
}