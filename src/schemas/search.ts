import {
  validation as experimentsVal,
  sanitization as experimentsSan,
} from './partials/experiments';

import { regex } from './utils';

const BLACKLIST_STRIPING_REGEX = regex.BLACKLIST_STRIPING_REGEX; 

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
            optional: true,
            minLength: 1
          },
          totalRecordCount: {
            type: 'integer',
            optional: false
          },
          area: {
            type: 'string',
            optional: true
          },
          biasingProfile: {
            type: 'string',
            optional: true
          },
          query: {
            type: 'string',
            optional: false
          },
          originalQuery: {
            type: 'string',
            optional: true
          },
          correctedQuery: {
            type: 'string',
            optional: true
          },
          warnings: {
            type: 'array',
            items: {
              type: 'string'
            },
            optional: true
          },
          errors: {
            type: 'string',
            optional: true
          },
          template: {
            type: 'object',
            optional: true,
            strict: true,
            properties: {
              name: {
                type: 'string',
                optional: true
              },
              ruleName: {
                type: 'string',
                optional: true
              },
              _id: {
                type: 'string',
                optional: true
              }
            }
          },
          pageInfo: {
            type: 'object',
            optional: false,
            strict: true,
            properties: {
              recordStart: {
                type: 'integer',
                optional: false
              },
              recordEnd: {
                type: 'integer',
                optional: false
              }
            }
          },
          relatedQueries: {
            type: 'array',
            items: {
              type: 'string'
            },
            optional: true
          },
          rewrites: {
            type: 'array',
            items: {
              type: 'string'
            },
            optional: true
          },
          redirect: {
            type: 'string',
            optional: true
          },
          siteParams: {
            type: 'array',
            optional: true,
            strict: true,
            items: {
              type: 'object',
              properties: {
                key: {
                  type: 'string',
                  optional: true
                },
                value: {
                  type: 'string',
                  optional: true
                }
              }
            }
          },
          availableNavigation: {
            type: 'array',
            optional: true,
            strict: true,
            items: {
              type: 'object',
              optional: true,
              strict: true,
              properties: {
                name: {
                  type: 'string',
                  optional: false
                },
                displayName: {
                  type: 'string',
                  optional: true
                },
                range: {
                  type: 'boolean',
                  optional: true
                },
                or: {
                  type: 'boolean',
                  optional: true
                },
                ignored: {
                  type: 'boolean',
                  optional: true
                },
                moreRefinements: {
                  type: 'boolean',
                  optional: true
                },
                _id: {
                  type: 'string',
                  optional: true
                },
                type: {
                  type: 'string',
                  optional: true
                },
                refinements: {
                  type: 'array',
                  optional: false,
                  items: {
                    type: 'object',
                    strict: true,
                    properties: {
                      type: {
                        type: 'string',
                        optional: false
                      },
                      _id: {
                        type: 'string',
                        optional: true
                      },
                      count: {
                        type: 'integer',
                        optional: true
                      },
                      exclude: {
                        type: 'boolean',
                        optional: true
                      },
                      value: {
                        type: 'string',
                        optional: true
                      },
                      high: {
                        type: 'string',
                        optional: true
                      },
                      low: {
                        type: 'string',
                        optional: true
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
            }
          },
          selectedNavigation: {
            type: 'array',
            optional: true,
            strict: true,
            items: {
              type: 'object',
              optional: true,
              strict: true,
              properties: {
                name: {
                  type: 'string',
                  optional: false
                },
                displayName: {
                  type: 'string',
                  optional: true
                },
                range: {
                  type: 'boolean',
                  optional: true
                },
                or: {
                  type: 'boolean',
                  optional: true
                },
                ignored: {
                  type: 'boolean',
                  optional: true
                },
                moreRefinements: {
                  type: 'boolean',
                  optional: true
                },
                _id: {
                  type: 'string',
                  optional: true
                },
                type: {
                  type: 'string',
                  optional: true
                },
                refinements: {
                  type: 'array',
                  optional: false,
                  items: {
                    type: 'object',
                    strict: true,
                    properties: {
                      type: {
                        type: 'string',
                        optional: false
                      },
                      _id: {
                        type: 'string',
                        optional: true
                      },
                      count: {
                        type: 'integer',
                        optional: true
                      },
                      exclude: {
                        type: 'boolean',
                        optional: true
                      },
                      value: {
                        type: 'string',
                        optional: true
                      },
                      high: {
                        type: 'string',
                        optional: true
                      },
                      low: {
                        type: 'string',
                        optional: true
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
            }
          },
          matchStrategy: {
            type: 'object',
            optional: true,
            strict: true,
            properties: {
              name: {
                type: 'string',
                optional: true
              },
              rules: {
                type: 'array',
                optional: true,
                items: {
                  type: 'object',
                  strict: true,
                  properties: {
                    terms: {
                      type: 'integer',
                      optional: true
                    },
                    termsGreaterThan: {
                      type: 'integer',
                      optional: true
                    },
                    mustMatch: {
                      type: 'integer',
                      optional: true
                    },
                    percentage: {
                      type: 'boolean',
                      optional: true
                    }
                  }
                }
              }
            }
          },
          records: {
            type: 'array',
            optional: true,
            items: {
              type: 'object',
              strict: true,
              properties: {
                allMeta: {
                  type: 'object',
                  optional: true,
                  strict: true,
                  properties: {
                    sku: {
                      type: 'string',
                      optional: true
                    },
                    productId: {
                      type: 'string',
                      optional: true
                    }
                  }
                },
                refinementMatches: {
                  type: 'array',
                  optional: true,
                  items: {
                    type: 'object',
                    strict: true,
                    properties: {
                      name: {
                        type: 'string',
                        optional: true
                      },
                      values: {
                        type: 'array',
                        optional: true,
                        items: {
                          type: 'object',
                          strict: true,
                          properties: {
                            value: {
                              type: 'string',
                              optional: true
                            },
                            count: {
                              type: 'integer',
                              optional: true
                            }
                          }
                        }
                      }
                    }
                  }
                },
                _id: {
                  type: 'string',
                  optional: true
                },
                _u: {
                  type: 'string',
                  optional: true
                },
                _t: {
                  type: 'string',
                  optional: true
                },
                collection: {
                  type: 'string',
                  optional: true
                }
              }
            }
          },
          didYouMean: {
            type: 'array',
            items: {
              type: 'string'
            },
            optional: true
          },
          originalRequest: {
            type: 'object',
            optional: true,
            strict: true,
            properties: {
              collection: {
                type: 'string',
                optional: true
              },
              area: {
                type: 'string',
                optional: true
              },
              sessionId: {
                type: 'string',
                optional: true
              },
              visitorId: {
                type: 'string',
                optional: true
              },
              biasingProfile: {
                type: 'string',
                optional: true
              },
              language: {
                type: 'string',
                optional: true
              },
              customUrlParams: {
                type: 'array',
                optional: true,
                items: {
                  type: 'object',
                  strict: true,
                  properties: {
                    key: {
                      type: 'string',
                      optional: true
                    },
                    value: {
                      type: 'string',
                      optional: true
                    }
                  }
                }
              },
              query: {
                type: 'string',
                optional: true
              },
              refinementQuery: {
                type: 'string',
                optional: true
              },
              matchStrategyName: {
                type: 'string',
                optional: true
              },
              matchStrategy: {
                type: 'object',
                optional: true,
                strict: true,
                properties: {
                  name: {
                    type: 'string',
                    optional: true
                  },
                  rules: {
                    type: 'array',
                    items: {
                      type: 'object',
                      optional: true,
                      strict: true,
                      properties: {
                        terms: {
                          type: 'integer',
                          optional: true
                        },
                        termsGreaterThan: {
                          type: 'integer',
                          optional: true
                        },
                        mustMatch: {
                          type: 'integer',
                          optional: true
                        },
                        percentage: {
                          type: 'boolean',
                          optional: true
                        }
                      }
                    }
                  }
                }
              },
              biasing: {
                type: 'object',
                optional: true,
                strict: true,
                properties: {
                  bringToTop: {
                    type: 'array',
                    items: {
                      type: 'string'
                    },
                    optional: true
                  },
                  augmentBiases: {
                    type: 'boolean',
                    optional: true
                  },
                  influence: {
                    type: 'number',
                    optional: true
                  },
                  biases: {
                    type: 'array',
                    optional: true,
                    items: {
                      type: 'object',
                      strict: true,
                      properties: {
                        name: {
                          type: 'string',
                          optional: true
                        },
                        content: {
                          type: 'string',
                          optional: true
                        },
                        strength: {
                          type: 'string',
                          optional: true
                        }
                      }
                    }
                  }
                }
              },
              skip: {
                type: 'integer',
                optional: true
              },
              pageSize: {
                type: 'integer',
                optional: true
              },
              returnBinary: {
                type: 'boolean',
                optional: true
              },
              disableAutocorrection: {
                type: 'boolean',
                optional: true
              },
              pruneRefinements: {
                type: 'boolean',
                optional: true
              },
              sort: {
                type: 'array',
                optional: true,
                items: {
                  type: 'object',
                  strict: true,
                  properties: {
                    field: {
                      type: 'string',
                      optional: true
                    },
                    order: {
                      type: 'string',
                      optional: true
                    }
                  }
                }
              },
              fields: {
                type: 'array',
                optional: true,
                items: {
                  type: 'string'
                }
              },
              orFields: {
                type: 'array',
                optional: true,
                items: {
                  type: 'string'
                }
              },
              wildcardSearchEnabled: {
                type: 'boolean',
                optional: true
              },
              restrictNavigation: {
                type: 'object',
                optional: true,
                strict: true,
                properties: {
                  name: {
                    type: 'string',
                    optional: true
                  },
                  count: {
                    type: 'integer',
                    optional: true
                  }
                }
              },
              includedNavigations: {
                type: 'array',
                optional: true,
                items: {
                  type: 'string'
                }
              },
              excludedNavigations: {
                type: 'array',
                optional: true,
                items: {
                  type: 'string'
                }
              },
              refinements: {
                type: 'array',
                optional: true,
                items: {
                  type: 'object',
                  strict: true,
                  properties: {
                    navigationName: {
                      type: 'string',
                      optional: true
                    },
                    type: {
                      type: 'string',
                      optional: true
                    },
                    _id: {
                      type: 'string',
                      optional: true
                    },
                    exclude: {
                      type: 'boolean',
                      optional: true
                    },
                    value: {
                      type: 'string',
                      optional: true
                    },
                    high: {
                      type: 'string',
                      optional: true
                    },
                    low: {
                      type: 'string',
                      optional: true
                    }
                  }
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
            optional: true,
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ]
          },
          totalRecordCount: {
            type: 'integer'
          },
          area: {
            type: 'string',
            maxLength: 10000,
            rules: [
              'trim'
            ]
          },
          biasingProfile: {
            type: 'string',
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ]
          },
          query: {
            type: 'string',
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ],
            exec: function querySanitizationXSS(schema, post) {
    if (typeof post === 'string') {
        // Strip using blacklist
        post = post.replace(BLACKLIST_STRIPING_REGEX, ' ');
        // Replace all whitespace combinations with a single space
        post = post.replace(/\s\s+/g, ' ');
        post = post.trim();
        return post;
    }
    else {
        return post;
    }
}
          },
          originalQuery: {
            type: 'string',
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ],
            exec: function querySanitizationXSS(schema, post) {
    if (typeof post === 'string') {
        // Strip using blacklist
        post = post.replace(BLACKLIST_STRIPING_REGEX, ' ');
        // Replace all whitespace combinations with a single space
        post = post.replace(/\s\s+/g, ' ');
        post = post.trim();
        return post;
    }
    else {
        return post;
    }
}
          },
          correctedQuery: {
            type: 'string',
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ],
            exec: function querySanitizationXSS(schema, post) {
    if (typeof post === 'string') {
        // Strip using blacklist
        post = post.replace(BLACKLIST_STRIPING_REGEX, ' ');
        // Replace all whitespace combinations with a single space
        post = post.replace(/\s\s+/g, ' ');
        post = post.trim();
        return post;
    }
    else {
        return post;
    }
}
          },
          warnings: {
            type: 'array',
            items: {
              type: 'string',
              maxLength: 10000,
              rules: [
                'trim',
                'lower'
              ]
            }
          },
          errors: {
            type: 'string',
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ]
          },
          template: {
            type: 'object',
            strict: true,
            properties: {
              name: {
                type: 'string',
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ]
              },
              ruleName: {
                type: 'string',
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ]
              },
              _id: {
                type: 'string',
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ]
              }
            }
          },
          pageInfo: {
            type: 'object',
            strict: true,
            properties: {
              recordStart: {
                type: 'integer'
              },
              recordEnd: {
                type: 'integer'
              }
            }
          },
          relatedQueries: {
            type: 'array',
            items: {
              maxLength: 10000,
              rules: [
                'trim',
                'lower'
              ]
            }
          },
          rewrites: {
            type: 'array',
            items: {
              maxLength: 10000,
              rules: [
                'trim',
                'lower'
              ]
            }
          },
          redirect: {
            type: 'string',
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ]
          },
          siteParams: {
            type: 'array',
            items: {
              type: 'object',
              strict: true,
              properties: {
                key: {
                  type: 'string',
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                value: {
                  type: 'string',
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                }
              }
            }
          },
          matchStrategy: {
            type: 'object',
            strict: true,
            properties: {
              name: {
                type: 'string',
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ]
              },
              rules: {
                type: 'array',
                items: {
                  type: 'object',
                  strict: true,
                  properties: {
                    terms: {
                      type: 'integer'
                    },
                    termsGreaterThan: {
                      type: 'integer'
                    },
                    mustMatch: {
                      type: 'integer'
                    },
                    percentage: {
                      type: 'boolean'
                    }
                  }
                }
              }
            }
          },
          availableNavigation: {
            type: 'array',
            optional: true,
            strict: true,
            items: {
              type: 'object',
              optional: true,
              strict: true,
              properties: {
                name: {
                  type: 'string',
                  maxLength: 10000,
                  rules: []
                },
                displayName: {
                  type: 'string',
                  maxLength: 10000,
                  rules: []
                },
                range: {
                  type: 'boolean'
                },
                or: {
                  type: 'boolean'
                },
                ignored: {
                  type: 'boolean'
                },
                moreRefinements: {
                  type: 'boolean'
                },
                _id: {
                  type: 'string',
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                type: {
                  type: 'string',
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                refinements: {
                  type: 'array',
                  items: {
                    type: 'object',
                    strict: true,
                    properties: {
                      type: {
                        type: 'string',
                        maxLength: 10000,
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      _id: {
                        type: 'string',
                        maxLength: 10000,
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      count: {
                        type: 'integer'
                      },
                      exclude: {
                        type: 'boolean'
                      },
                      value: {
                        type: 'string',
                        maxLength: 10000,
                        rules: []
                      },
                      high: {
                        type: 'string',
                        maxLength: 10000,
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      low: {
                        type: 'string',
                        maxLength: 10000,
                        rules: [
                          'trim',
                          'lower'
                        ]
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
            }
          },
          selectedNavigation: {
            type: 'array',
            optional: true,
            strict: true,
            items: {
              type: 'object',
              optional: true,
              strict: true,
              properties: {
                name: {
                  type: 'string',
                  maxLength: 10000,
                  rules: []
                },
                displayName: {
                  type: 'string',
                  maxLength: 10000,
                  rules: []
                },
                range: {
                  type: 'boolean'
                },
                or: {
                  type: 'boolean'
                },
                ignored: {
                  type: 'boolean'
                },
                moreRefinements: {
                  type: 'boolean'
                },
                _id: {
                  type: 'string',
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                type: {
                  type: 'string',
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                refinements: {
                  type: 'array',
                  items: {
                    type: 'object',
                    strict: true,
                    properties: {
                      type: {
                        type: 'string',
                        maxLength: 10000,
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      _id: {
                        type: 'string',
                        maxLength: 10000,
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      count: {
                        type: 'integer'
                      },
                      exclude: {
                        type: 'boolean'
                      },
                      value: {
                        type: 'string',
                        maxLength: 10000,
                        rules: []
                      },
                      high: {
                        type: 'string',
                        maxLength: 10000,
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      low: {
                        type: 'string',
                        maxLength: 10000,
                        rules: [
                          'trim',
                          'lower'
                        ]
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
            }
          },
          records: {
            type: 'array',
            items: {
              type: 'object',
              strict: true,
              properties: {
                allMeta: {
                  type: 'object',
                  strict: true,
                  properties: {
                    sku: {
                      type: 'string',
                      maxLength: 10000,
                      rules: [
                        'trim'
                      ]
                    },
                    productId: {
                      type: 'string',
                      maxLength: 10000,
                      rules: [
                        'trim'
                      ]
                    }
                  }
                },
                refinementMatches: {
                  type: 'array',
                  items: {
                    type: 'object',
                    strict: true,
                    properties: {
                      name: {
                        type: 'string',
                        maxLength: 10000,
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      values: {
                        type: 'array',
                        items: {
                          type: 'object',
                          strict: true,
                          properties: {
                            value: {
                              type: 'string',
                              maxLength: 10000,
                              rules: [
                                'trim',
                                'lower'
                              ]
                            },
                            count: {
                              type: 'integer'
                            }
                          }
                        }
                      }
                    }
                  }
                },
                _id: {
                  type: 'string',
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                _u: {
                  type: 'string',
                  maxLength: 10000,
                  rules: [
                    'trim'
                  ]
                },
                _t: {
                  type: 'string',
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                collection: {
                  type: 'string',
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                }
              }
            }
          },
          didYouMean: {
            type: 'array',
            items: {
              maxLength: 10000,
              rules: [
                'trim',
                'lower'
              ]
            }
          },
          originalRequest: {
            type: 'object',
            optional: true,
            strict: true,
            properties: {
              collection: {
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
                  'trim',
                  'lower'
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
              visitorId: {
                type: 'string',
                maxLength: 10000,
                rules: [
                  'trim'
                ]
              },
              biasingProfile: {
                type: 'string',
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ]
              },
              language: {
                type: 'string',
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ]
              },
              customUrlParams: {
                type: 'array',
                items: {
                  type: 'object',
                  strict: true,
                  properties: {
                    key: {
                      type: 'string',
                      maxLength: 10000,
                      rules: [
                        'trim',
                        'lower'
                      ]
                    },
                    value: {
                      type: 'string',
                      maxLength: 10000,
                      rules: [
                        'trim',
                        'lower'
                      ]
                    }
                  }
                }
              },
              query: {
                type: 'string',
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ],
                exec: function querySanitizationXSS(schema, post) {
    if (typeof post === 'string') {
        // Strip using blacklist
        post = post.replace(BLACKLIST_STRIPING_REGEX, ' ');
        // Replace all whitespace combinations with a single space
        post = post.replace(/\s\s+/g, ' ');
        post = post.trim();
        return post;
    }
    else {
        return post;
    }
}
              },
              refinementQuery: {
                type: 'string',
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ]
              },
              matchStrategyName: {
                type: 'string',
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ]
              },
              matchStrategy: {
                type: 'object',
                strict: true,
                properties: {
                  name: {
                    type: 'string',
                    maxLength: 10000,
                    rules: [
                      'trim',
                      'lower'
                    ]
                  },
                  rules: {
                    type: 'array',
                    items: {
                      type: 'object',
                      strict: true,
                      properties: {
                        terms: {
                          type: 'integer'
                        },
                        termsGreaterThan: {
                          type: 'integer'
                        },
                        mustMatch: {
                          type: 'integer'
                        },
                        percentage: {
                          type: 'boolean'
                        }
                      }
                    }
                  }
                }
              },
              biasing: {
                type: 'object',
                strict: true,
                properties: {
                  bringToTop: {
                    type: 'array',
                    items: {
                      maxLength: 10000,
                      rules: [
                        'trim',
                        'lower'
                      ]
                    }
                  },
                  augmentBiases: {
                    type: 'boolean'
                  },
                  influence: {
                    type: 'number'
                  },
                  biases: {
                    type: 'array',
                    items: {
                      type: 'object',
                      strict: true,
                      properties: {
                        name: {
                          type: 'string',
                          maxLength: 10000,
                          rules: [
                            'trim',
                            'lower'
                          ]
                        },
                        content: {
                          type: 'string',
                          maxLength: 10000,
                          rules: [
                            'trim',
                            'lower'
                          ]
                        },
                        strength: {
                          type: 'string',
                          maxLength: 10000,
                          rules: [
                            'trim',
                            'lower'
                          ]
                        }
                      }
                    }
                  }
                }
              },
              skip: {
                type: 'integer'
              },
              pageSize: {
                type: 'integer'
              },
              returnBinary: {
                type: 'boolean'
              },
              disableAutocorrection: {
                type: 'boolean'
              },
              pruneRefinements: {
                type: 'boolean'
              },
              sort: {
                type: 'array',
                items: {
                  type: 'object',
                  strict: true,
                  properties: {
                    field: {
                      type: 'string',
                      maxLength: 10000,
                      rules: [
                        'trim',
                        'lower'
                      ]
                    },
                    order: {
                      type: 'string',
                      maxLength: 10000,
                      rules: [
                        'trim',
                        'lower'
                      ]
                    }
                  }
                }
              },
              fields: {
                type: 'array',
                items: {
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                }
              },
              orFields: {
                type: 'array',
                items: {
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                }
              },
              wildcardSearchEnabled: {
                type: 'boolean'
              },
              restrictNavigation: {
                type: 'object',
                strict: true,
                properties: {
                  name: {
                    type: 'string',
                    maxLength: 10000,
                    rules: []
                  },
                  count: {
                    type: 'integer'
                  }
                }
              },
              includedNavigations: {
                type: 'array',
                items: {
                  maxLength: 10000,
                  rules: []
                }
              },
              excludedNavigations: {
                type: 'array',
                items: {
                  maxLength: 10000,
                  rules: []
                }
              },
              refinements: {
                type: 'array',
                items: {
                  type: 'object',
                  strict: true,
                  properties: {
                    navigationName: {
                      type: 'string',
                      maxLength: 10000,
                      rules: []
                    },
                    type: {
                      type: 'string',
                      maxLength: 10000,
                      rules: [
                        'trim',
                        'lower'
                      ]
                    },
                    _id: {
                      type: 'string',
                      maxLength: 10000,
                      rules: [
                        'trim',
                        'lower'
                      ]
                    },
                    exclude: {
                      type: 'boolean'
                    },
                    value: {
                      type: 'string',
                      maxLength: 10000,
                      rules: []
                    },
                    high: {
                      type: 'string',
                      maxLength: 10000,
                      rules: [
                        'trim',
                        'lower'
                      ]
                    },
                    low: {
                      type: 'string',
                      maxLength: 10000,
                      rules: [
                        'trim',
                        'lower'
                      ]
                    }
                  }
                }
              }
            }
          }
        },
        optional: false
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