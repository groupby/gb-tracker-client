import {
  validation as experimentsVal,
  sanitization as experimentsSan,
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
      },
      experiments: experimentsVal,
    }
  },
  sanitization: {
    type: 'object',
    strict: true,
    properties: {
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
      responseId: {
        type: 'string',
        optional: true,
        maxLength: 10000,
        rules: [
          'trim',
          'lower'
        ]
      },
      search: {
        type: 'object',
        strict: true,
        properties: {
          origin: {
            type: 'object',
            strict: true,
            properties: {
              autosearch: {
                type: 'boolean',
                optional: false,
                def: false
              },
              collectionSwitcher: {
                type: 'boolean',
                optional: false,
                def: false
              },
              dym: {
                type: 'boolean',
                optional: false,
                def: false
              },
              navigation: {
                type: 'boolean',
                optional: false,
                def: false
              },
              recommendations: {
                type: 'boolean',
                optional: false,
                def: false
              },
              sayt: {
                type: 'boolean',
                optional: false,
                def: false
              },
              search: {
                type: 'boolean',
                optional: false,
                def: false
              }
            }
          },
          id: {
            type: 'string',
            optional: false,
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ]
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
    }
  }
}