var utils = require('./utils'); const BLACKLIST_STRIPING_REGEX = utils.regex.BLACKLIST_STRIPING_REGEX; 
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
                optional: false
              },
              recordEnd: {
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
                      optional: true
                    },
                    termsGreaterThan: {
                      optional: true
                    },
                    mustMatch: {
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
                          optional: true
                        },
                        termsGreaterThan: {
                          optional: true
                        },
                        mustMatch: {
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
                optional: true
              },
              pageSize: {
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
      }
    }
  }
}