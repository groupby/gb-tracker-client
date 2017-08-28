var utils = require('./utils');
module.exports={
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
                optional: true
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
                optional: true
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
}