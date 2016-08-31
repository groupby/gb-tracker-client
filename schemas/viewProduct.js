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
      product: {
        type: 'object',
        properties: {
          category: {
            type: 'string'
          },
          collection: {
            type: 'string',
            optional: false
          },
          title: {
            type: 'string'
          },
          sku: {
            type: 'string',
            optional: true
          },
          productId: {
            type: 'string'
          },
          parentId: {
            type: 'string',
            optional: true
          },
          margin: {
            type: 'number',
            optional: true
          },
          price: {
            type: 'number'
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
      product: {
        properties: {
          category: {
            rules: [
              'trim',
              'lower'
            ]
          },
          collection: {
            rules: [
              'trim',
              'lower'
            ],
            optional: false,
            def: 'Production'
          },
          title: {
            rules: [
              'trim',
              'lower'
            ]
          },
          sku: {
            rules: [
              'trim',
              'lower'
            ],
            optional: true
          },
          productId: {
            rules: [
              'trim',
              'lower'
            ]
          },
          parentId: {
            rules: [
              'trim',
              'lower'
            ],
            optional: true
          },
          margin: {
            type: 'number',
            optional: true
          },
          price: {
            type: 'number'
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