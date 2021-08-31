import {
  validation as experimentsVal,
  sanitization as experimentsSan,
} from './partials/experiments';

import {
  validation as searchAttributionTokenVal,
  sanitization as searchAttributionTokenSan,
} from './partials/searchAttributionToken';

export default {
  sanitization: {
    type: 'object',
    strict: true,
    properties: {
      cart: {
        type: 'object',
        strict: true,
        properties: {
          id: {
            type: 'string',
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ],
            optional: true
          },
          cartType: {
            type: 'string',
            maxLength: 10000,
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
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ],
                  optional: true
                },
                collection: {
                  type: 'string',
                  maxLength: 10000,
                  rules: [
                    'trim'
                  ],
                  optional: false,
                  def: 'default'
                },
                title: {
                  type: 'string',
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                sku: {
                  type: 'string',
                  maxLength: 10000,
                  rules: [
                    'trim'
                  ],
                  optional: true
                },
                productId: {
                  type: 'string',
                  maxLength: 10000,
                  rules: [
                    'trim'
                  ]
                },
                parentId: {
                  type: 'string',
                  maxLength: 10000,
                  rules: [
                    'trim'
                  ],
                  optional: true
                },
                margin: {
                  type: 'number',
                  optional: true
                },
                price: {
                  type: 'number',
                  optional: true
                },
                currency: {
                  type: 'string',
                  optional: true
                },
                quantity: {
                  type: 'integer'
                },
                metadata: {
                  type: 'array',
                  optional: true,
                  items: {
                    strict: true,
                    type: 'object',
                    properties: {
                      key: {
                        type: 'string',
                        rules: [
                          'trim',
                          'lower'
                        ],
                        maxLength: 10000
                      },
                      value: {
                        type: 'string',
                        rules: [
                          'trim',
                          'lower'
                        ],
                        maxLength: 10000
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
                  type: 'string',
                  rules: [
                    'trim',
                    'lower'
                  ],
                  maxLength: 10000
                },
                value: {
                  type: 'string',
                  rules: [
                    'trim',
                    'lower'
                  ],
                  maxLength: 10000
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
            type: 'string',
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ]
          },
          version: {
            type: 'string',
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ],
            optional: true
          },
          prerelease: {
            type: 'array',
            maxLength: 1000,
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
            maxLength: 1000,
            items: {
              maxLength: 10000,
              rules: [
                'trim',
                'lower'
              ]
            },
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
          }
        }
      },
      customer: {
        type: 'object',
        strict: true,
        properties: {
          id: {
            type: 'string',
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ]
          },
          area: {
            type: 'string',
            maxLength: 10000,
            rules: [
              'trim'
            ],
            optional: false,
            def: 'Production'
          }
        }
      },
      eventType: {
        type: 'string',
        maxLength: 10000,
        rules: [
          'trim'
        ]
      },
      metadata: {
        type: 'array',
        optional: true,
        items: {
          strict: true,
          type: 'object',
          properties: {
            key: {
              type: 'string',
              rules: [
                'trim',
                'lower'
              ],
              maxLength: 10000
            },
            value: {
              type: 'string',
              rules: [
                'trim',
                'lower'
              ],
              maxLength: 10000
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
                type: 'string',
                maxLength: 10000,
                rules: [
                  'trim'
                ]
              },
              sessionId: {
                type: 'string',
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ]
              },
              loginId: {
                type: 'string',
                maxLength: 10000,
                rules: [
                  'trim'
                ]
              }
            }
          }
        }
      },
      experiments: experimentsSan,
      searchAttributionToken: searchAttributionTokenSan,
    }
  }
}
