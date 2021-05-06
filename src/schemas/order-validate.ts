import {
  validation as experimentsVal,
} from './partials/experiments';

import {
  validation as searchAttributionTokenVal,
} from './partials/searchAttributionToken';

export default {
  validation: {
    type: 'object',
    strict: true,
    properties: {
      cart: {
        type: 'object',
        strict: true,
        properties: {
          id: {
            type: 'string',
            optional: true
          },
          cartType: {
            type: 'string',
            optional: true
          },
          items: {
            type: 'array',
            items: {
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
                  type: 'string',
                  optional: false
                },
                sku: {
                  type: 'string',
                  optional: true
                },
                productId: {
                  type: 'string',
                  optional: false
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
                  optional: true,
                  minLength: 3,
                  maxLength: 3,
                  error: 'must be a valid 3-letter ISO 4217 Code.'
                },
                quantity: {
                  optional: false
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
            }
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
      searchAttributionToken: searchAttributionTokenVal,
    }
  }
}
