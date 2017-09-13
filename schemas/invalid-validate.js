var utils = require('./utils');
module.exports={
  validation: {
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
            optional: true
          },
          minor: {
            optional: true
          },
          patch: {
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
}