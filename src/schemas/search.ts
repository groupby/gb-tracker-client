import {
  validation as experimentsVal,
  sanitization as experimentsSan,
} from './partials/experiments';

import { regex } from './utils';

const BLACKLIST_STRIPING_REGEX = regex.BLACKLIST_STRIPING_REGEX; 

export default {
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