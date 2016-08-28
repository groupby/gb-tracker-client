var utils = require('./utils');
module.exports={
  validation: {
    type: 'object',
    properties: {
      responseId: {
        type: 'string',
        pattern: /^[0-9a-f]{40}$/,
        error: 'must be SHA1 hex'
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
              wisdom: {
                type: 'boolean',
                optional: false
              }
            },
            strict: true
          }
        },
        strict: true
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
        optional: true,
        strict: true,
        properties: {
          '*': {
            type: 'string'
          }
        }
      },
      rawSearchResults: {
        type: 'object',
        properties: {
          responseId: {
            type: 'string',
            optional: true
          },
          totalRecordCount: {
            type: 'integer',
            optional: true
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
            optional: true
          },
          originalQuery: {
            type: 'string',
            optional: true
          },
          template: {
            type: 'object',
            properties: {
              name: {
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
                optional: true
              },
              recordEnd: {
                type: 'integer',
                optional: true
              }
            },
            optional: true
          },
          matchStrategy: {
            type: 'object',
            properties: {
              rules: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
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
                  optional: true
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
                refinements: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: {
                        type: 'string',
                        optional: true
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
                  optional: true
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
                        optional: true
                      },
                      name: {
                        type: 'string',
                        optional: true
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
                      name: {
                        type: 'string',
                        optional: true
                      },
                      count: {
                        type: 'integer',
                        optional: true
                      },
                      value: {
                        type: 'string',
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
        optional: true
      }
    },
    strict: true
  },
  sanitization: {
    properties: {
      responseId: {},
      eventType: {},
      customer: {
        properties: {
          id: {},
          area: {
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
              wisdom: {
                optional: false,
                def: false
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
              visitorId: {},
              sessionId: {}
            },
            strict: true
          }
        },
        strict: true
      },
      metadata: {},
      rawSearchResults: {
        properties: {
          responseId: {},
          totalRecordCount: {
            type: 'integer'
          },
          area: {},
          biasingProfile: {},
          query: {},
          originalQuery: {},
          template: {
            properties: {
              name: {}
            }
          },
          pageInfo: {
            properties: {
              recordStart: {
                type: 'integer'
              },
              recordEnd: {
                type: 'integer'
              }
            }
          },
          matchStrategy: {
            properties: {
              rules: {
                type: 'array',
                items: {
                  type: undefined,
                  properties: {
                    termsGreaterThan: {
                      type: 'integer'
                    },
                    mustMatch: {
                      type: 'integer'
                    },
                    percentage: {}
                  }
                }
              }
            }
          },
          availableNavigation: {
            type: 'array',
            items: {
              type: undefined,
              properties: {
                name: {},
                displayName: {},
                range: {},
                or: {},
                metadata: {
                  type: 'array',
                  items: {
                    type: undefined,
                    properties: {
                      key: {},
                      value: {}
                    }
                  }
                },
                refinements: {
                  type: 'array',
                  items: {
                    type: undefined,
                    properties: {
                      type: {},
                      count: {
                        type: 'integer'
                      },
                      value: {},
                      high: {},
                      low: {}
                    }
                  }
                }
              }
            }
          },
          selectedNavigation: {
            type: 'array',
            items: {
              type: undefined,
              properties: {
                name: {},
                displayName: {},
                range: {},
                or: {},
                metadata: {
                  type: 'array',
                  items: {
                    type: undefined,
                    properties: {
                      key: {},
                      name: {}
                    }
                  }
                },
                refinements: {
                  type: 'array',
                  items: {
                    type: undefined,
                    properties: {
                      name: {},
                      count: {
                        type: 'integer'
                      },
                      value: {}
                    }
                  }
                }
              }
            }
          },
          records: {
            type: 'array',
            items: {
              type: undefined,
              properties: {
                allMeta: {
                  strict: false
                },
                _id: {},
                _u: {},
                _t: {}
              }
            }
          },
          didYouMean: {
            type: 'array',
            items: {
              type: undefined
            }
          }
        }
      }
    },
    strict: true
  }
}