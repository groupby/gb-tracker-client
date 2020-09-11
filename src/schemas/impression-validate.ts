import {
    validation as experimentsVal,
} from './partials/experiments';

export default {
    validation: {
        type: 'object',
        strict: true,
        properties: {
            impression: {
                type: 'object',
                strict: true,
                properties: {
                    impressionType: {
                        type: 'string',
                        optional: false
                    },
                    products: {
                        type: 'array',
                        optional: false,
                        strict: true,
                        items: {
                            type: 'object',
                            optional: false,
                            strict: true,
                            properties: {
                                category: {
                                    type: 'string',
                                    optional: true
                                },
                                collection: {
                                    type: 'string',
                                    optional: false
                                },
                                title: {
                                    type: 'string'
                                },
                                sku: {
                                    type: 'string',
                                    optional: true
                                },
                                productId: {
                                    type: 'string'
                                },
                                parentId: {
                                    type: 'string',
                                    optional: true
                                },
                                margin: {
                                    type: 'number',
                                    optional: true
                                },
                                price: {
                                    type: 'number',
                                    optional: false
                                },
                                currency: {
                                    type: 'string',
                                    optional: true
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
                }
            },
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
}
