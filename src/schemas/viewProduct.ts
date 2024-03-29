import { sanitization as experimentsSan } from './partials/experiments';
import { productSanitization } from './partials/products';

import { sanitization as searchAttributionTokenSan } from './partials/searchAttributionToken';

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
            product: productSanitization,
            experiments: experimentsSan,
            searchAttributionToken: searchAttributionTokenSan,
        }
    }
}
