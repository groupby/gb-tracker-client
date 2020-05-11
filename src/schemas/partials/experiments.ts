import { MAX_STR_LENGTH } from '../utils';

export const sanitization = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            experimentId: {
                type: 'string',
                maxLength: MAX_STR_LENGTH,
                rules: [
                    'trim',
                ],
            },
            experimentVariant: {
                type: 'string',
                maxLength: MAX_STR_LENGTH,
                rules: [
                    'trim',
                ],
            },
        },
    },
};

/**
 * By making the array of experiments optional but the properties of each item
 * in the array not optional, it enables the requirement that if one property
 * in the experiment were provided, the other must be provided too. 
 */
export const validation = {
    type: 'array',
    optional: true,
    items: {
        type: 'object',
        properties: {
            experimentId: {
                type: 'string',
                optional: false,
            },
            experimentVariant: {
                type: 'string',
                optional: false,
            },
        },
    },
};
