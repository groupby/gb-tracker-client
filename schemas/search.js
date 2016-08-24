var utils = require('./utils');
module.exports={
  validation: {
    type: 'object',
    properties: {
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
          totalRecordCount: {
            type: 'integer'
          },
          pageInfo: {
            type: 'object',
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
          },
          selectedRefinements: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  optional: true
                },
                displayName: {
                  type: 'string'
                },
                range: {
                  type: 'boolean',
                  optional: true
                },
                or: {
                  type: 'boolean',
                  optional: false
                },
                refinements: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      value: {
                        type: 'string',
                        optional: true
                      },
                      count: {
                        type: 'integer'
                      },
                      type: {
                        type: 'string'
                      },
                      low: {
                        type: 'number',
                        optional: true
                      },
                      high: {
                        type: 'number',
                        optional: true
                      }
                    },
                    strict: true
                  }
                }
              },
              strict: true
            }
          },
          searchTerm: {
            type: 'string'
          },
          rawSearchResults: {
            type: 'object',
            properties: {
              autoId: {
                type: 'string'
              },
              totalRecordCount: {
                type: 'integer'
              },
              area: {
                type: 'string'
              },
              biasingProfile: {
                type: 'string'
              },
              query: {
                type: 'string'
              },
              originalQuery: {
                type: 'string'
              },
              template: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  }
                },
                strict: true
              },
              pageInfo: {
                type: 'object',
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
                type: 'object',
                properties: {
                  rules: {
                    type: 'object',
                    properties: {
                      termsGreaterThan: {
                        type: 'integer'
                      },
                      mustMatch: {
                        type: 'integer'
                      },
                      percentage: {
                        type: 'boolean'
                      }
                    },
                    strict: true
                  }
                },
                strict: true
              },
              availableNavigation: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  },
                  displayName: {
                    type: 'string'
                  },
                  range: {
                    type: 'boolean'
                  },
                  or: {
                    type: 'boolean'
                  },
                  metadata: {
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
                  refinements: {
                    type: 'object',
                    properties: {
                      type: {
                        type: 'string'
                      },
                      count: {
                        type: 'integer'
                      },
                      value: {
                        type: 'string'
                      },
                      high: {
                        type: 'string'
                      },
                      low: {
                        type: 'string'
                      }
                    },
                    strict: true
                  }
                },
                strict: true
              },
              selectedNavigation: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  },
                  displayName: {
                    type: 'string'
                  },
                  range: {
                    type: 'boolean'
                  },
                  or: {
                    type: 'boolean'
                  },
                  metadata: {
                    type: 'object',
                    properties: {
                      key: {
                        type: 'string'
                      },
                      name: {
                        type: 'string'
                      }
                    },
                    strict: true
                  },
                  refinements: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string'
                      },
                      count: {
                        type: 'integer'
                      },
                      value: {
                        type: 'string'
                      }
                    },
                    strict: true
                  }
                },
                strict: true
              },
              records: {
                type: 'object',
                properties: {
                  allMeta: {
                    type: 'object'
                  },
                  _id: {
                    type: 'string'
                  },
                  _u: {
                    type: 'string'
                  },
                  _t: {
                    type: 'string'
                  }
                },
                strict: true
              },
              didYouMean: {
                type: 'string'
              }
            },
            strict: true,
            optional: true
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
      additionalMetadata: {
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
          autoId: {
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
          totalRecordCount: {
            type: 'integer'
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
          },
          selectedRefinements: {
            type: 'array',
            items: {
              type: undefined,
              properties: {
                name: {
                  optional: true
                },
                displayName: {},
                range: {
                  optional: true
                },
                or: {
                  optional: false,
                  def: false
                },
                refinements: {
                  type: 'array',
                  items: {
                    type: undefined,
                    properties: {
                      value: {
                        optional: true
                      },
                      count: {
                        type: 'integer'
                      },
                      type: {},
                      low: {
                        type: 'number',
                        optional: true
                      },
                      high: {
                        type: 'number',
                        optional: true
                      }
                    },
                    strict: true
                  }
                }
              },
              strict: true
            }
          },
          searchTerm: {
            exec: (schema, post) => {
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
          rawSearchResults: {
            properties: {
              autoId: {},
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
              matchStrategy: {
                properties: {
                  rules: {
                    properties: {
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
                },
                strict: true
              },
              availableNavigation: {
                properties: {
                  name: {},
                  displayName: {},
                  range: {},
                  or: {},
                  metadata: {
                    properties: {
                      key: {},
                      value: {}
                    },
                    strict: true
                  },
                  refinements: {
                    properties: {
                      type: {},
                      count: {
                        type: 'integer'
                      },
                      value: {},
                      high: {},
                      low: {}
                    },
                    strict: true
                  }
                },
                strict: true
              },
              selectedNavigation: {
                properties: {
                  name: {},
                  displayName: {},
                  range: {},
                  or: {},
                  metadata: {
                    properties: {
                      key: {},
                      name: {}
                    },
                    strict: true
                  },
                  refinements: {
                    properties: {
                      name: {},
                      count: {
                        type: 'integer'
                      },
                      value: {}
                    },
                    strict: true
                  }
                },
                strict: true
              },
              records: {
                properties: {
                  allMeta: {},
                  _id: {},
                  _u: {},
                  _t: {}
                },
                strict: true
              },
              didYouMean: {}
            },
            strict: true,
            optional: true
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
      additionalMetadata: {
        optional: true
      },
      rawSearchResults: {
        properties: {
          autoId: {},
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