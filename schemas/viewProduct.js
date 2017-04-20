var utils = require('./utils');
module.exports={
  validation: {
    type: 'object',
    properties: {
      id: {
        type: 'string'
      },
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
      product: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            optional: true
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
  },
  sanitization: {
    properties: {
      id: {
        maxLength: 10000,
        rules: [
          'trim',
          'lower'
        ]
      },
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
              maxLength: 10000,
              rules: [
                'trim',
                'lower'
              ]
            },
            optional: true
          },
          build: {
            type: 'array',
            items: {
              maxLength: 10000,
              rules: [
                'trim',
                'lower'
              ]
            },
            optional: true
          },
          version: {
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ],
            optional: true
          }
        },
        strict: true
      },
      eventType: {
        maxLength: 10000,
        rules: [
          'trim'
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
              'trim'
            ],
            optional: false,
            def: 'Production'
          }
        },
        strict: true
      },
      product: {
        properties: {
          category: {
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ],
            optional: true
          },
          collection: {
            maxLength: 10000,
            rules: [
              'trim'
            ],
            optional: false,
            def: 'default'
          },
          title: {
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ]
          },
          sku: {
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ],
            optional: true
          },
          productId: {
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ]
          },
          parentId: {
            maxLength: 10000,
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
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                value: {
                  maxLength: 10000,
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
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ]
              },
              sessionId: {
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ]
              },
              loginId: {
                maxLength: 10000,
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
              maxLength: 10000,
              rules: [
                'trim',
                'lower'
              ]
            },
            value: {
              maxLength: 10000,
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