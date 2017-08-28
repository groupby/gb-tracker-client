var utils = require('./utils');
module.exports={
  type: 'object',
  properties: {
    clientVersion: {
      type: 'object',
      properties: {
        raw: {
          type: 'string',
          optional: true
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
      optional: true
    },
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
}