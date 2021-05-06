import { MAX_STR_LENGTH } from '../utils';

export const sanitization = {
    type: 'string',
    maxLength: MAX_STR_LENGTH,
    rules: [
        'trim'
    ],
};

export const validation = {
    type: 'string',
    optional: true,
    minLength: 1,
};
