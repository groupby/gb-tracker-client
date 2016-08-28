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
      cart: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            optional: true
          },
          totalItems: {
            type: 'integer',
            optional: true
          },
          totalQuantity: {
            type: 'integer',
            optional: true
          },
          totalPrice: {
            type: 'number',
            optional: true
          },
          generatedTotalPrice: {
            type: 'number',
            optional: true
          },
          items: {
            type: 'array',
            items: {
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
                id: {
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
                quantity: {
                  type: 'integer'
                },
                metadata: {
                  type: 'object',
                  optional: true
                }
              },
              strict: true
            }
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
      cart: {
        properties: {
          id: {
            optional: true
          },
          totalItems: {
            type: 'integer',
            optional: true
          },
          totalQuantity: {
            type: 'integer',
            optional: true
          },
          totalPrice: {
            type: 'number',
            optional: true
          },
          generatedTotalPrice: {
            type: 'number',
            optional: true
          },
          items: {
            type: 'array',
            items: {
              type: undefined,
              properties: {
                category: {},
                collection: {
                  optional: false,
                  def: 'Production'
                },
                title: {},
                sku: {
                  optional: true
                },
                id: {},
                parentId: {
                  optional: true
                },
                margin: {
                  type: 'number',
                  optional: true
                },
                price: {
                  type: 'number'
                },
                quantity: {
                  type: 'integer'
                },
                metadata: {
                  optional: true
                }
              },
              strict: true
            }
          },
          metadata: {}
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