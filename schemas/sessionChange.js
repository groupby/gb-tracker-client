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
  },
  sanitization: {
    properties: {
      eventType: {
        rules: [
          'trim'
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
              'trim'
            ],
            optional: false,
            def: 'default'
          }
        },
        strict: true
      },
      session: {
        properties: {
          previousSessionId: {
            rules: [
              'trim',
              'lower'
            ],
            optional: true
          },
          newSessionId: {
            rules: [
              'trim',
              'lower'
            ]
          },
          previousVisitorId: {
            rules: [
              'trim',
              'lower'
            ],
            optional: true
          },
          newVisitorId: {
            rules: [
              'trim',
              'lower'
            ]
          }
        },
        strict: true
      },
      visit: {
        properties: {
          customerData: {
            properties: {
              visitorId: {
                rules: [
                  'trim',
                  'lower'
                ]
              },
              sessionId: {
                rules: [
                  'trim',
                  'lower'
                ]
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
          properties: {
            key: {
              rules: [
                'trim',
                'lower'
              ]
            },
            value: {
              rules: [
                'trim',
                'lower'
              ]
            }
          },
          strict: true
        },
        optional: true
      }
    },
    strict: true
  }
}