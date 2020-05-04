var utils = require('./utils'); const BLACKLIST_STRIPING_REGEX = utils.regex.BLACKLIST_STRIPING_REGEX; 
export default {
  validation: {
    type: 'object',
    strict: true,
    properties: {
      clientVersion: {
        type: 'object',
        strict: true,
        properties: {
          raw: {
            type: 'string'
          },
          version: {
            type: 'string',
            optional: true
          },
          prerelease: {
            type: 'array',
            optional: true,
            items: {
              type: 'string'
            }
          },
          build: {
            type: 'array',
            optional: true,
            items: {
              type: 'string'
            }
          },
          major: {
            optional: true
          },
          minor: {
            optional: true
          },
          patch: {
            optional: true
          }
        }
      },
      customer: {
        type: 'object',
        strict: true,
        properties: {
          id: {
            type: 'string'
          },
          area: {
            type: 'string',
            optional: false
          }
        }
      },
      eventType: {
        type: 'string'
      },
      metadata: {
        type: 'array',
        optional: true,
        items: {
          strict: true,
          type: 'object',
          properties: {
            key: {
              type: 'string'
            },
            value: {
              type: 'string'
            }
          }
        }
      },
      responseId: {
        type: 'string',
        optional: true
      },
      search: {
        type: 'object',
        optional: false,
        strict: true,
        properties: {
          origin: {
            type: 'object',
            optional: false,
            strict: true,
            properties: {
              autosearch: {
                type: 'boolean',
                optional: false
              },
              collectionSwitcher: {
                type: 'boolean',
                optional: false
              },
              dym: {
                type: 'boolean',
                optional: false
              },
              navigation: {
                type: 'boolean',
                optional: false
              },
              recommendations: {
                type: 'boolean',
                optional: false
              },
              sayt: {
                type: 'boolean',
                optional: false
              },
              search: {
                type: 'boolean',
                optional: false
              }
            }
          },
          id: {
            type: 'string',
            optional: false,
            minLength: 1
          }
        }
      },
      visit: {
        type: 'object',
        strict: true,
        properties: {
          customerData: {
            type: 'object',
            strict: true,
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
            }
          }
        }
      }
    }
  }
}