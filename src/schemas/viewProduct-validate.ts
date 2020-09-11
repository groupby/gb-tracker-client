import {
  validation as experimentsVal,
} from './partials/experiments';

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
      product: {
        type: 'object',
        strict: true,
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
          currency: {
            optional: true
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
      },
      experiments: experimentsVal,
    }
  }
}
