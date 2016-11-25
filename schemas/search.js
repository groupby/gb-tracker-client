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
            strict: true
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
          template: {
            type: 'object',
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
                moreRefinements: {
                  type: 'boolean',
                  optional: true
                },
                type: {
                  type: 'string',
                  optional: true
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
                      count: {
                        type: 'integer',
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
                moreRefinements: {
                  type: 'boolean',
                  optional: true
                },
                type: {
                  type: 'string',
                  optional: true
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
                      count: {
                        type: 'integer',
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
                  optional: true,
                  strict: false
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
              query: {
                type: 'string',
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
              }
            },
            optional: true
          }
        },
        type: 'object',
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
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ],
            items: {},
            optional: true
          },
          build: {
            type: 'array',
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ],
            items: {},
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
            exec: {}
          },
          originalQuery: {
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ],
            exec: {}
          },
          template: {},
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
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ],
            items: {}
          },
          rewrites: {
            type: 'array',
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ],
            items: {}
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
                moreRefinements: {},
                type: {
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
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
                      count: {
                        type: 'integer'
                      },
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
                moreRefinements: {},
                type: {
                  maxLength: 10000,
                  rules: [
                    'trim',
                    'lower'
                  ]
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
                      count: {
                        type: 'integer'
                      },
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
          records: {
            type: 'array',
            items: {
              properties: {
                allMeta: {
                  strict: false
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
            maxLength: 10000,
            rules: [
              'trim',
              'lower'
            ],
            items: {}
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
              query: {
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ]
              },
              skip: {
                type: 'integer'
              },
              pageSize: {
                type: 'integer'
              },
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
                maxLength: 10000,
                rules: [
                  'trim',
                  'lower'
                ],
                items: {}
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