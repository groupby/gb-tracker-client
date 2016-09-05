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
  },
  sanitization: {
    properties: {
      clientVersion: {
        properties: {
          raw: {
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ]
          },
          major: {
            type: 'integer'
          },
          minor: {
            type: 'integer'
          },
          patch: {
            type: 'integer'
          },
          prerelease: {
            type: 'array',
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ],
            items: {
              type: undefined
            }
          },
          build: {
            type: 'array',
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ],
            items: {
              type: undefined
            }
          },
          version: {
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ]
          }
        }
      },
      eventType: {
        maxLength: 10000,
        rules: [
          'trim',
          'lower'
        ]
      },
      eventString: {
        maxLength: 10000,
        rules: [
          'trim',
          'lower'
        ]
      },
      customer: {
        properties: {
          id: {
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ]
          },
          area: {
            maxLength: 10000,
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