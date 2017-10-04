var utils = require('./utils');
module.exports={
  validation: {
    type: 'object',
    properties: {
      clientVersion: {
        type: 'object',
        properties: {
          raw: {
            type: 'string'
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
      cart: {
        type: 'object',
        properties: {
          totalItems: {
            optional: true
          },
          totalQuantity: {
            optional: true
          },
          totalPrice: {
            optional: true
          },
          generatedTotalPrice: {
            optional: true
          },
          id: {
            type: 'string',
            optional: true
          },
          items: {
            type: 'array',
            items: {
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
                  optional: true
                },
                price: {
                  optional: true
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
                },
                quantity: {}
              },
              strict: true
            }
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
  }
}