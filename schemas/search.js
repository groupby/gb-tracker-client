var utils = require('./utils');
module.exports={
  validation: {
    type: 'object',
    properties: {
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
          matchStrategy: {
            type: 'object',
            properties: {
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
                    }
                  },
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
                    }
                  },
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
      responseId: {
        rules: [
          'trim',
          'lower'
        ],
        optional: true
      },
      eventType: {
        rules: [
          'trim'
        ]
      },
      customer: {
        properties: {
          id: {
            rules: [
              'trim',
              'lower'
            ]
          },
          area: {
            rules: [
              'trim'
            ],
            optional: false,
            def: 'default'
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
              }
            },
            strict: true
          },
          totalRecordCount: {
            type: 'integer'
          },
          area: {
            rules: [
              'trim'
            ]
          },
          biasingProfile: {
            rules: [
              'trim',
              'lower'
            ]
          },
          query: {
            rules: [
              'trim',
              'lower'
            ],
            exec: {}
          },
          originalQuery: {
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
          matchStrategy: {
            properties: {
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
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                displayName: {
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                range: {},
                or: {},
                metadata: {
                  type: 'array',
                  items: {
                    properties: {
                      key: {
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      value: {
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
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      count: {
                        type: 'integer'
                      },
                      value: {
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      high: {
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      low: {
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
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                displayName: {
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                range: {},
                or: {},
                metadata: {
                  type: 'array',
                  items: {
                    properties: {
                      key: {
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      value: {
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
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      count: {
                        type: 'integer'
                      },
                      value: {
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      high: {
                        rules: [
                          'trim',
                          'lower'
                        ]
                      },
                      low: {
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
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                _u: {
                  rules: [
                    'trim',
                    'lower'
                  ]
                },
                _t: {
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
            rules: [
              'trim',
              'lower'
            ],
            items: {}
          }
        },
        strict: true
      },
      visit: {
        properties: {
          customerData: {
            properties: {
              visitorId: {
                rules: [
                  'trim',
                  'lower'
                ]
              },
              sessionId: {
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
              rules: [
                'trim',
                'lower'
              ]
            },
            value: {
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