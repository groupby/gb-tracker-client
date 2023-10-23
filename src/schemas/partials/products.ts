export const productSanitization = {
  type: 'object',
  optional: false,
  strict: true,
  properties: {
    category: {
      type: 'string',
      maxLength: 10000,
      rules: [
        'trim',
        'lower'
      ],
      optional: true
    },
    collection: {
      type: 'string',
      maxLength: 10000,
      rules: [
        'trim'
      ],
      optional: false,
      def: 'default'
    },
    title: {
      type: 'string',
      maxLength: 10000,
      rules: [
        'trim',
        'lower'
      ]
    },
    sku: {
      type: 'string',
      maxLength: 10000,
      rules: [
        'trim'
      ],
      optional: true
    },
    productId: {
      type: 'string',
      maxLength: 10000,
      rules: [
        'trim'
      ]
    },
    parentId: {
      type: 'string',
      maxLength: 10000,
      rules: [
        'trim'
      ],
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
};

export const productsSanitization = {
  type: 'array',
  optional: false,
  strict: true,
  items: productSanitization,
};