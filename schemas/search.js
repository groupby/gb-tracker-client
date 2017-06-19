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
      responseId: {
        type: 'string',
        optional: true
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
      search: {
        type: 'object',
        properties: {
          origin: {
            type: 'object',
            properties: {
              sayt: {
                type: 'boolean',
                optional: false
              },
              dym: {
                type: 'boolean',
                optional: false
              },
              search: {
                type: 'boolean',
                optional: false
              },
              recommendations: {
                type: 'boolean',
                optional: false
              },
              autosearch: {
                type: 'boolean',
                optional: false
              },
              navigation: {
                type: 'boolean',
                optional: false
              },
              collectionSwitcher: {
                type: 'boolean',
                optional: false
              }
            },
            strict: true,
            optional: false
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
            },
            optional: true
          },
          pageInfo: {
            type: 'object',
            properties: {
              recordStart: {
                type: 'integer',
                optional: false
              },
              recordEnd: {
                type: 'integer',
                optional: false
              }
            },
            optional: false
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
            },
            optional: true
          },
          matchStrategy: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                optional: true
              },
              rules: {
                type: 'array',
                items: {
                  type: 'object',
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
                },
                optional: true
              }
            },
            optional: true
          },
          availableNavigation: {
            type: 'array',
            items: {
              type: 'object',
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
                  items: {
                    type: 'object',
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
                  },
                  optional: false
                },
                metadata: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      key: {
                        type: 'string',
                        optional: false
                      },
                      value: {
                        type: 'string',
                        optional: false
                      }
                    },
                    strict: true
                  },
                  optional: true,
                  strict: true
                }
              }
            },
            optional: true
          },
          selectedNavigation: {
            type: 'array',
            items: {
              type: 'object',
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
                  items: {
                    type: 'object',
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
                  },
                  optional: false
                },
                metadata: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      key: {
                        type: 'string',
                        optional: false
                      },
                      value: {
                        type: 'string',
                        optional: false
                      }
                    },
                    strict: true
                  },
                  optional: true,
                  strict: true
                }
              }
            },
            optional: true
          },
          records: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                allMeta: {
                  type: 'object',
                  properties: {
                    sku: {
                      type: 'string',
                      optional: true
                    },
                    productId: {
                      type: 'string',
                      optional: true
                    }
                  },
                  optional: true
                },
                refinementMatches: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        optional: true
                      },
                      values: {
                        type: 'array',
                        items: {
                          type: 'object',
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
                        },
                        optional: true
                      }
                    }
                  },
                  optional: true
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
            },
            optional: true
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
                },
                optional: true
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
                properties: {
                  name: {
                    type: 'string',
                    optional: true
                  },
                  rules: {
                    type: 'array',
                    items: {
                      type: 'object',
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
                    },
                    optional: true
                  }
                },
                optional: true
              },
              biasing: {
                type: 'object',
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
                    items: {
                      type: 'object',
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
                    },
                    optional: true
                  }
                },
                optional: true
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
                items: {
                  type: 'object',
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
                },
                optional: true
              },
              fields: {
                type: 'array',
                items: {
                  type: 'string'
                },
                optional: true
              },
              orFields: {
                type: 'array',
                items: {
                  type: 'string'
                },
                optional: true
              },
              wildcardSearchEnabled: {
                type: 'boolean',
                optional: true
              },
              restrictNavigation: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    optional: true
                  },
                  count: {
                    type: 'integer',
                    optional: true
                  }
                },
                optional: true
              },
              includedNavigations: {
                type: 'array',
                items: {
                  type: 'string'
                },
                optional: true
              },
              excludedNavigations: {
                type: 'array',
                items: {
                  type: 'string'
                },
                optional: true
              },
              refinements: {
                type: 'array',
                items: {
                  type: 'object',
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
                },
                optional: true
              }
            },
            optional: true
          }
        },
        optional: false
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
      responseId: {
        maxLength: 10000,
        rules: [
          'trim',
          'lower'
        ],
        optional: true
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
      search: {
        properties: {
          origin: {
            properties: {
              sayt: {
                optional: false,
                def: false
              },
              dym: {
                optional: false,
                def: false
              },
              search: {
                optional: false,
                def: false
              },
              recommendations: {
                optional: false,
                def: false
              },
              autosearch: {
                optional: false,
                def: false
              },
              navigation: {
                optional: false,
                def: false
              },
              collectionSwitcher: {
                optional: false,
                def: false
              }
            },
            strict: true
          },
          id: {
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
            maxLength: 10000,
            rules: [
              'trim'
            ]
          },
          biasingProfile: {
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ]
          },
          query: {
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ],
            exec: function (schema, post) {
  if (typeof post === 'string') {
    // Strip using blacklist
    post = post.replace(utils.regex.BLACKLIST_STRIPING_REGEX, ' ');

    // Replace all whitespace combinations with a single space
    post = post.replace(/\s\s+/g, ' ');

    post = post.trim();

    return post;
  } else {
    return post;
  }
}
          },
          originalQuery: {
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ],
            exec: function (schema, post) {
  if (typeof post === 'string') {
    // Strip using blacklist
    post = post.replace(utils.regex.BLACKLIST_STRIPING_REGEX, ' ');

    // Replace all whitespace combinations with a single space
    post = post.replace(/\s\s+/g, ' ');

    post = post.trim();

    return post;
  } else {
    return post;
  }
}
          },
          correctedQuery: {
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ],
            exec: function (schema, post) {
  if (typeof post === 'string') {
    // Strip using blacklist
    post = post.replace(utils.regex.BLACKLIST_STRIPING_REGEX, ' ');

    // Replace all whitespace combinations with a single space
    post = post.replace(/\s\s+/g, ' ');

    post = post.trim();

    return post;
  } else {
    return post;
  }
}
          },
          warnings: {
            type: 'array',
            items: {
              maxLength: 10000,
              rules: [
                'trim',
                'lower'
              ]
            }
          },
          errors: {
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ]
          },
          template: {
            properties: {
              name: {
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ]
              },
              ruleName: {
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ]
              },
              _id: {
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ]
              }
            },
            strict: true
          },
          pageInfo: {
            properties: {
              recordStart: {
                type: 'integer'
              },
              recordEnd: {
                type: 'integer'
              }
            },
            strict: true
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
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ]
          },
          siteParams: {
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
            }
          },
          matchStrategy: {
            properties: {
              name: {
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ]
              },
              rules: {
                type: 'array',
                items: {
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
                    percentage: {}
                  },
                  strict: true
                }
              }
            },
            strict: true
          },
          availableNavigation: {
            type: 'array',
            items: {
              properties: {
                name: {
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                displayName: {
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                range: {},
                or: {},
                ignored: {},
                moreRefinements: {},
                _id: {
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                type: {
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                refinements: {
                  type: 'array',
                  items: {
                    properties: {
                      type: {
                        maxLength: 10000,
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      _id: {
                        maxLength: 10000,
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      count: {
                        type: 'integer'
                      },
                      exclude: {},
                      value: {
                        maxLength: 10000,
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      high: {
                        maxLength: 10000,
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      low: {
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
                  }
                }
              },
              strict: true
            }
          },
          selectedNavigation: {
            type: 'array',
            items: {
              properties: {
                name: {
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                displayName: {
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                range: {},
                or: {},
                ignored: {},
                moreRefinements: {},
                _id: {
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                type: {
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                refinements: {
                  type: 'array',
                  items: {
                    properties: {
                      type: {
                        maxLength: 10000,
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      _id: {
                        maxLength: 10000,
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      count: {
                        type: 'integer'
                      },
                      exclude: {},
                      value: {
                        maxLength: 10000,
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      high: {
                        maxLength: 10000,
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      low: {
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
                  }
                }
              },
              strict: true
            }
          },
          records: {
            type: 'array',
            items: {
              properties: {
                allMeta: {
                  properties: {
                    sku: {
                      maxLength: 10000,
                      rules: [
                        'trim',
                        'lower'
                      ],
                      type: 'string'
                    },
                    productId: {
                      maxLength: 10000,
                      rules: [
                        'trim',
                        'lower'
                      ],
                      type: 'string'
                    }
                  },
                  strict: true
                },
                refinementMatches: {
                  type: 'array',
                  items: {
                    properties: {
                      name: {
                        maxLength: 10000,
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      values: {
                        type: 'array',
                        items: {
                          properties: {
                            value: {
                              maxLength: 10000,
                              rules: [
                                'trim',
                                'lower'
                              ]
                            },
                            count: {
                              type: 'integer'
                            }
                          },
                          strict: true
                        }
                      }
                    },
                    strict: true
                  }
                },
                _id: {
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                _u: {
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                _t: {
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                collection: {
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
            properties: {
              collection: {
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ]
              },
              area: {
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
              visitorId: {
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ]
              },
              biasingProfile: {
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ]
              },
              language: {
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ]
              },
              customUrlParams: {
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
                }
              },
              query: {
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ],
                exec: function (schema, post) {
  if (typeof post === 'string') {
    // Strip using blacklist
    post = post.replace(utils.regex.BLACKLIST_STRIPING_REGEX, ' ');

    // Replace all whitespace combinations with a single space
    post = post.replace(/\s\s+/g, ' ');

    post = post.trim();

    return post;
  } else {
    return post;
  }
}
              },
              refinementQuery: {
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ]
              },
              matchStrategyName: {
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ]
              },
              matchStrategy: {
                properties: {
                  name: {
                    maxLength: 10000,
                    rules: [
                      'trim',
                      'lower'
                    ]
                  },
                  rules: {
                    type: 'array',
                    items: {
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
                        percentage: {}
                      },
                      strict: true
                    }
                  }
                },
                strict: true
              },
              biasing: {
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
                  augmentBiases: {},
                  influence: {
                    type: 'number'
                  },
                  biases: {
                    type: 'array',
                    items: {
                      properties: {
                        name: {
                          maxLength: 10000,
                          rules: [
                            'trim',
                            'lower'
                          ]
                        },
                        content: {
                          maxLength: 10000,
                          rules: [
                            'trim',
                            'lower'
                          ]
                        },
                        strength: {
                          maxLength: 10000,
                          rules: [
                            'trim',
                            'lower'
                          ]
                        }
                      },
                      strict: true
                    }
                  }
                },
                strict: true
              },
              skip: {
                type: 'integer'
              },
              pageSize: {
                type: 'integer'
              },
              returnBinary: {},
              disableAutocorrection: {},
              pruneRefinements: {},
              sort: {
                type: 'array',
                items: {
                  properties: {
                    field: {
                      maxLength: 10000,
                      rules: [
                        'trim',
                        'lower'
                      ]
                    },
                    order: {
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
              wildcardSearchEnabled: {},
              restrictNavigation: {
                properties: {
                  name: {
                    maxLength: 10000,
                    rules: [
                      'trim',
                      'lower'
                    ]
                  },
                  count: {
                    type: 'integer'
                  }
                },
                strict: true
              },
              includedNavigations: {
                type: 'array',
                items: {
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                }
              },
              excludedNavigations: {
                type: 'array',
                items: {
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
                }
              },
              refinements: {
                type: 'array',
                items: {
                  properties: {
                    navigationName: {
                      maxLength: 10000,
                      rules: [
                        'trim',
                        'lower'
                      ]
                    },
                    type: {
                      maxLength: 10000,
                      rules: [
                        'trim',
                        'lower'
                      ]
                    },
                    _id: {
                      maxLength: 10000,
                      rules: [
                        'trim',
                        'lower'
                      ]
                    },
                    exclude: {},
                    value: {
                      maxLength: 10000,
                      rules: [
                        'trim',
                        'lower'
                      ]
                    },
                    high: {
                      maxLength: 10000,
                      rules: [
                        'trim',
                        'lower'
                      ]
                    },
                    low: {
                      maxLength: 10000,
                      rules: [
                        'trim',
                        'lower'
                      ]
                    }
                  },
                  strict: true
                }
              }
            },
            strict: true
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