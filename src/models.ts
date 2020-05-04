/**
 * This file contains types exported for consuming libraries. Normally this
 * would be exported from the library root, but for legacy reasons, the full
 * tracker is currently exported from the library root. Therefore, consumers
 * importing from the library root will have a large bundle size. Therefore,
 * the types are here instead so that consumers can import them without causing
 * a large bundle size.
 */

const MAX_ARRAY_LENGTH = 1000;
const MAX_STR_LENGTH = 10000;

export {
    MAX_ARRAY_LENGTH,
    MAX_STR_LENGTH,
};


// import {
//     AutoMoreRefinements as AutoMoreRefinementsPartial,
// } from '@groupby/beacon-models/partials/autoMoreRefinements';
export type Id = string;
export interface AutoMoreRefinementsPartial {
    id: Id;
}

//import { Metadata } from '@groupby/beacon-models/partials/metadata';
export type Metadata = { key: string, value: string }[];
// import {
//     Cart,
// } from '@groupby/beacon-models/partials/cart';

export interface Item {
    category?: string;
    collection: string;
    title: string;
    sku?: string;
    productId: string;
    parentId?: string;
    margin?: number;
    price?: number;
    quantity: number;
    metadata?: Metadata;
}

export interface Cart {
    id?: string;
    items: Item[];
    metadata?: Metadata;
}

// import {
//     DirectSearch as DirectSearchPartial,
// } from '@groupby/beacon-models/partials/directSearch';

export interface SearchNavigation {
    name: string;
    displayName?: string;
    range?: boolean;
    or?: boolean;
    ignored?: boolean;
    _id?: string;
    type?: string;
    metadata?: Metadata;
    refinements: {
        type: string,
        _id?: string,
        count?: number,
        exclude?: boolean,
        value?: string,
        high?: string,
        low?: string,
    }[];
    moreRefinements?: boolean;
};
export type SearchNavigationList = SearchNavigation[];

export interface SearchQuery {
    collection?: string;
    area?: string;
    sessionId?: string;
    visitorId?: string;
    biasingProfile?: string;
    language?: string;
    customUrlParams?: { [key: string]: string }[];
    query?: string;
    refinementQuery?: string;
    matchStrategyName?: string;
    matchStrategy: {
        name: string,
        rules: {
            terms: number,
            termsGreaterThan: number,
            mustMatch: number,
            percentage: boolean,
        }[],
    };
    biasing?: {
        bringToTop?: string[],
        augmentBiases?: boolean,
        influence?: number,
        biases?: {
            name?: string,
            content?: string,
            strength?: string,
        }[],
    };
    skip?: number;
    pageSize?: number;
    returnBinary?: boolean;
    disableAutocorrection?: boolean;
    pruneRefinements?: boolean;
    sort?: {
        field?: string,
        order?: string,
    }[];
    fields?: string[];
    orFields?: string[];
    wildcardSearchEnabled?: boolean;
    restrictNavigation?: {
        name?: string,
        count?: number,
    };
    includedNavigations?: string[];
    excludedNavigations?: string[];
    refinements?: {
        navigationName?: string,
        type?: string,
        _id?: string,
        exclude?: boolean,
        value?: string,
        high?: string,
        low?: string,
    }[];
};

export interface DirectSearchPartial {
    id: Id;
    totalRecordCount: number;
    area?: string;
    biasingProfile?: string;
    query: string;
    originalQuery?: string;
    correctedQuery?: string;
    warnings?: string[];
    errors?: string;
    template?: {
        name?: string,
        ruleName?: string,
        _id?: string,
    };
    pageInfo: {
        recordStart: number,
        recordEnd: number,
    };
    relatedQueries?: string[];
    rewrites?: string[];
    redirect?: string;
    siteParams?: { [idx: string]: string }[];
    matchStrategy?: {
        name?: string,
        rules?: {
            terms?: number,
            termsGreaterThan?: number,
            mustMatch?: number,
            percentage?: boolean,
        }[],
    };
    availableNavigation?: SearchNavigationList;
    selectedNavigation?: SearchNavigationList;
    records?: {
        allMeta?: {
            sku?: string,
            productId?: string,
        },
        refinementMatches?: {
            name?: string,
            values?: {
                value?: string,
                count?: number,
            }[],
        }[],
        _id?: string,
        _u?: string,
        _t?: string,
        collection?: string,
    }[];
    didYouMean?: string[];
    originalRequest?: SearchQuery;
}
// import {
//     EventCustomer,
// } from '@groupby/beacon-models/partials/customer';

export interface EventCustomer {
    id: string;
    area: string;
}

//
// import {
//     Product,
// } from '@groupby/beacon-models/partials/product';

export interface Product {
    category?: string;
    collection: string;
    title: string;
    sku?: string;
    productId: string;
    parentId?: string;
    margin?: number;
    price?: number;
    metadata?: Metadata;
}



export interface SendableOrigin {
    sayt?: boolean;
    dym?: boolean;
    search?: boolean;
    recommendations?: boolean;
    autosearch?: boolean;
    navigation?: boolean;
    collectionSwitcher?: boolean;
}

interface CartEvent {
    cart: Cart;
    metadata?: Metadata;
}

/**
 * The data for an Add to Cart event.
 */
export interface AddToCartEvent extends CartEvent {}
/**
 * The data for a View Cart event.
 */
export interface ViewCartEvent extends CartEvent {}
/**
 * The data for a Remove from Cart event.
 */
export interface RemoveFromCartEvent extends CartEvent {};
/**
 * The data for an Order event.
 */
export interface OrderEvent extends CartEvent {};
/**
 * The data for a Search event.
 */
export interface SearchEvent {
    search: DirectSearchPartial & {
        origin: SendableOrigin;
    };
}
/**
 * The data for an AutoSearch event.
 */
export interface AutoSearchEvent {
    search: {
        id: string;
        origin: SendableOrigin;
    };
}
/**
 * The data for an AutoMoreRefinements event.
 */
export interface AutoMoreRefinementsEvent {
    moreRefinements: AutoMoreRefinementsPartial;
}
/**
 * The data for a View Product event.
 */
export interface ViewProductEvent {
    product: Product;
}

/**
 * Comment for GroupBy internal:
 * 
 * Notice how the VariationGroup event, partial, and sanitization & validation
 * schemas are in this package instead of the "common models" package. This is
 * because many interfaces were moved into a public "common models" package
 * when GroupBy still relied on Node.js for most of its server code. We no
 * longer need to use Node.js on the server so we don't need this new beacon
 * type to be in a common public package. It only needs to be here. In the
 * future, the original beacon types can also have all of their JS code moved
 * here to simplify things.
 * 
 * Keep this comment separate from the JSDoc comments so that TypeScript
 * tooling doesn't pick up on it. It isn't relevant for GroupBy customers
 * implementing beacons.
 */

/**
 *  Validation and Sanitization for Cart
 *
 */

export const metadataSan = {
    type: 'array',
    optional: true,
    items: {
        strict: true,
        type: 'object',
        properties: {
            key: { type: 'string', rules: ['trim', 'lower'], maxLength: MAX_STR_LENGTH },
            value: { type: 'string', rules: ['trim', 'lower'], maxLength: MAX_STR_LENGTH },
        },
    },
};

export const metadataVal = {
    type: 'array',
    optional: true,
    items: {
        strict: true,
        type: 'object',
        properties: {
            key: { type: 'string' },
            value: { type: 'string' },
        },
    },
};

export const itemVal = {
    type: 'object',
    strict: true,
    properties: {
        category: { type: 'string', optional: true },
        collection: { type: 'string', optional: false },
        title: { type: 'string', optional: false },
        sku: { type: 'string', optional: true },
        productId: { type: 'string', optional: false },
        parentId: { type: 'string', optional: true },
        margin: { type: 'number', optional: true },
        price: { type: 'number', optional: true },
        quantity: { type: 'integer', optional: false },
        metadata: metadataVal,
    },
};

export const itemSan = {
    type: 'object',
    strict: true,
    properties: {
        category: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'], optional: true },
        collection: {
            type: 'string',
            maxLength: MAX_STR_LENGTH,
            rules: ['trim'],
            optional: false,
            def: 'default',
        },
        title: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
        sku: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim'], optional: true },
        productId: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim'] },
        parentId: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim'], optional: true },
        margin: { type: 'number', optional: true },
        price: { type: 'number', optional: true },
        quantity: { type: 'integer' },
        metadata: metadataSan,
    },
};


export const cartSan = {
    type: 'object',
    strict: true,
    properties: {
        id: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'], optional: true },
        items: { type: 'array', items: itemSan },
        metadata: metadataSan,
    },
};

export const cartVal = {
    type: 'object',
    strict: true,
    properties: {
        id: { type: 'string', optional: true },
        items: { type: 'array', items: itemVal },
        metadata: metadataVal,
    },
};

/**
 * Sanitization and Validation for Product
 */
export const productSan = {
    type: 'object',
    strict: true,
    properties: {
        category: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'], optional: true },
        collection: {
            type: 'string',
            maxLength: MAX_STR_LENGTH,
            rules: ['trim'],
            optional: false,
            def: 'default',
        },
        title: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
        sku: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim'], optional: true },
        productId: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim'] },
        parentId: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim'], optional: true },
        margin: { type: 'number', optional: true },
        price: { type: 'number', optional: true },
        metadata: metadataSan,
    },
};

export const productVal = {
    type: 'object',
    strict: true,
    properties: {
        category: { type: 'string', optional: true },
        collection: { type: 'string', optional: false },
        title: { type: 'string' },
        sku: { type: 'string', optional: true },
        productId: { type: 'string' },
        parentId: { type: 'string', optional: true },
        margin: { type: 'number', optional: true },
        price: { type: 'number', optional: true },
        metadata: metadataVal,
    },
};

/**
 * Validation and Sanitization for AutoMoreRefinement
 */


export const idSan = {
    type: 'string',
    optional: false,
    maxLength: MAX_STR_LENGTH,
    rules: ['trim', 'lower'],
};

export const idVal = {
    type: 'string',
    optional: false,
    minLength: 1,
};
export const autoMoreRefinementSan = {
    type: 'object',
    strict: true,
    properties: {
        id: idSan,
    },
};

export const autoMoreRefinementSanVal = {
    type: 'object',
    strict: true,
    properties: {
        id: idVal,
    },
};

/**
 * Validation and Sanitization for DirectSearch
 */

export const searchNavigationSanitization = {
    type: 'object',
    optional: true,
    strict: true,
    properties: {
        name: { type: 'string', maxLength: MAX_STR_LENGTH, rules: [] },
        displayName: { type: 'string', maxLength: MAX_STR_LENGTH, rules: [] },
        range: { type: 'boolean' },
        or: { type: 'boolean' },
        ignored: { type: 'boolean' },
        moreRefinements: { type: 'boolean' },
        _id: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
        type: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
        refinements: {
            type: 'array',
            items: {
                type: 'object',
                strict: true,
                properties: {
                    type: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                    _id: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                    count: { type: 'integer' },
                    exclude: { type: 'boolean' },
                    value: { type: 'string', maxLength: MAX_STR_LENGTH, rules: [] },
                    high: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                    low: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                },
            },
        },
        metadata: metadataSan,
    },
};

export const searchNavigationValidation = {
    type: 'object',
    optional: true,
    strict: true,
    properties: {
        name: { type: 'string', optional: false },
        displayName: { type: 'string', optional: true },
        range: { type: 'boolean', optional: true },
        or: { type: 'boolean', optional: true },
        ignored: { type: 'boolean', optional: true },
        moreRefinements: { type: 'boolean', optional: true },
        _id: { type: 'string', optional: true },
        type: { type: 'string', optional: true },
        refinements: {
            type: 'array',
            optional: false,
            items: {
                type: 'object',
                strict: true,
                properties: {
                    type: { type: 'string', optional: false },
                    _id: { type: 'string', optional: true },
                    count: { type: 'integer', optional: true },
                    exclude: { type: 'boolean', optional: true },
                    value: { type: 'string', optional: true },
                    high: { type: 'string', optional: true },
                    low: { type: 'string', optional: true },
                },
            },
        },
        metadata: metadataVal,
    },
};


export const searchNavigationListSan = {
    type: 'array',
    optional: true,
    strict: true,
    items: searchNavigationSanitization,
};

export const searchNavigationListVal = {
    type: 'array',
    optional: true,
    strict: true,
    items: searchNavigationValidation,
};

import regexRewritePattern from 'regexpu-core';

// Absolute minimum to limit XSS
// \p{Me} - a character that encloses the character is is combined with (circle, square, keycap, etc.).
// \p{C} - invisible control characters and unused code points.
// likely XSS charactesr: <>=;(){}[]?
const BLACKLIST_STRIPING_REGEX = new RegExp(regexRewritePattern('[\\p{Me}\\p{C}<>=;(){}\\[\\]?]', 'u', {
    unicodePropertyEscape: true,
    useUnicodeFlag: false,
}), 'g');

/**
 * Use as 'exec' for schema-inspector
 */
export function querySanitizationXSS(schema: any, post: any) {
    if (typeof post === 'string') {
        // Strip using blacklist
        post = post.replace(BLACKLIST_STRIPING_REGEX, ' ');

        // Replace all whitespace combinations with a single space
        post = post.replace(/\s\s+/g, ' ');

        post = post.trim();

        return post;
    } else {
        return post;
    }
}

export const searchQuerySan = {
    type: 'object',
    optional: true,
    strict: true,
    properties: {
        collection: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
        area: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
        sessionId: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
        visitorId: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
        biasingProfile: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
        language: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
        customUrlParams: {
            type: 'array',
            items: {
                type: 'object',
                strict: true,
                properties: {
                    key: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                    value: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                },
            },
        },
        query: {
            type: 'string',
            maxLength: MAX_STR_LENGTH,
            rules: ['trim', 'lower'],
            exec: querySanitizationXSS,
        },
        refinementQuery: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
        matchStrategyName: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
        matchStrategy: {
            type: 'object',
            strict: true,
            properties: {
                name: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                rules: {
                    type: 'array',
                    items: {
                        type: 'object',
                        strict: true,
                        properties: {
                            terms: { type: 'integer' },
                            termsGreaterThan: { type: 'integer' },
                            mustMatch: { type: 'integer' },
                            percentage: { type: 'boolean' },
                        },
                    },
                },
            },
        },
        biasing: {
            type: 'object',
            strict: true,
            properties: {
                bringToTop: { type: 'array', items: { maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] } },
                augmentBiases: { type: 'boolean' },
                influence: { type: 'number' },
                biases: {
                    type: 'array',
                    items: {
                        type: 'object',
                        strict: true,
                        properties: {
                            name: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                            content: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                            strength: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                        },
                    },
                },
            },
        },
        skip: { type: 'integer' },
        pageSize: { type: 'integer' },
        returnBinary: { type: 'boolean' },
        disableAutocorrection: { type: 'boolean' },
        pruneRefinements: { type: 'boolean' },
        sort: {
            type: 'array',
            items: {
                type: 'object',
                strict: true,
                properties: {
                    field: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                    order: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                },
            },
        },
        fields: { type: 'array', items: { maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] } },
        orFields: { type: 'array', items: { maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] } },
        wildcardSearchEnabled: { type: 'boolean' },
        restrictNavigation: {
            type: 'object',
            strict: true,
            properties: {
                name: { type: 'string', maxLength: MAX_STR_LENGTH, rules: [] },
                count: { type: 'integer' },
            },
        },
        includedNavigations: { type: 'array', items: { maxLength: MAX_STR_LENGTH, rules: [] } },
        excludedNavigations: { type: 'array', items: { maxLength: MAX_STR_LENGTH, rules: [] } },
        refinements: {
            type: 'array',
            items: {
                type: 'object',
                strict: true,
                properties: {
                    navigationName: { type: 'string', maxLength: MAX_STR_LENGTH, rules: [] },
                    type: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                    _id: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                    exclude: { type: 'boolean' },
                    value: { type: 'string', maxLength: MAX_STR_LENGTH, rules: [] },
                    high: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                    low: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                },
            },
        },
    },
};

export const searchQueryVal = {
    type: 'object',
    optional: true,
    strict: true,
    properties: {
        collection: { type: 'string', optional: true },
        area: { type: 'string', optional: true },
        sessionId: { type: 'string', optional: true },
        visitorId: { type: 'string', optional: true },
        biasingProfile: { type: 'string', optional: true },
        language: { type: 'string', optional: true },
        customUrlParams: {
            type: 'array',
            optional: true,
            items: {
                type: 'object',
                strict: true,
                properties: {
                    key: { type: 'string', optional: true },
                    value: { type: 'string', optional: true },
                },
            },
        },
        query: { type: 'string', optional: true },
        refinementQuery: { type: 'string', optional: true },
        matchStrategyName: { type: 'string', optional: true },
        matchStrategy: {
            type: 'object',
            optional: true,
            strict: true,
            properties: {
                name: { type: 'string', optional: true },
                rules: {
                    type: 'array',
                    items: {
                        type: 'object',
                        optional: true,
                        strict: true,
                        properties: {
                            terms: { type: 'integer', optional: true },
                            termsGreaterThan: { type: 'integer', optional: true },
                            mustMatch: { type: 'integer', optional: true },
                            percentage: { type: 'boolean', optional: true },
                        },
                    },
                },
            },
        },
        biasing: {
            type: 'object',
            optional: true,
            strict: true,
            properties: {
                bringToTop: {
                    type: 'array',
                    items: { type: 'string' },
                    optional: true,
                },
                augmentBiases: { type: 'boolean', optional: true },
                influence: { type: 'number', optional: true },
                biases: {
                    type: 'array',
                    optional: true,
                    items: {
                        type: 'object',
                        strict: true,
                        properties: {
                            name: { type: 'string', optional: true },
                            content: { type: 'string', optional: true },
                            strength: { type: 'string', optional: true },
                        },
                    },
                },
            },
        },
        skip: { type: 'integer', optional: true },
        pageSize: { type: 'integer', optional: true },
        returnBinary: { type: 'boolean', optional: true },
        disableAutocorrection: { type: 'boolean', optional: true },
        pruneRefinements: { type: 'boolean', optional: true },
        sort: {
            type: 'array',
            optional: true,
            items: {
                type: 'object',
                strict: true,
                properties: {
                    field: { type: 'string', optional: true },
                    order: { type: 'string', optional: true },
                },
            },
        },
        fields: {
            type: 'array',
            optional: true,
            items: { type: 'string' },
        },
        orFields: {
            type: 'array',
            optional: true,
            items: { type: 'string' },
        },
        wildcardSearchEnabled: { type: 'boolean', optional: true },
        restrictNavigation: {
            type: 'object',
            optional: true,
            strict: true,
            properties: {
                name: { type: 'string', optional: true },
                count: { type: 'integer', optional: true },
            },
        },
        includedNavigations: {
            type: 'array',
            optional: true,
            items: { type: 'string' },
        },
        excludedNavigations: {
            type: 'array',
            optional: true,
            items: { type: 'string' },
        },
        refinements: {
            type: 'array',
            optional: true,
            items: {
                type: 'object',
                strict: true,
                properties: {
                    navigationName: { type: 'string', optional: true },
                    type: { type: 'string', optional: true },
                    _id: { type: 'string', optional: true },
                    exclude: { type: 'boolean', optional: true },
                    value: { type: 'string', optional: true },
                    high: { type: 'string', optional: true },
                    low: { type: 'string', optional: true },
                },
            },
        },
    },
};

export const directSearchSan = {
    type: 'object',
    optional: false,
    strict: true,
    properties: {
        id: idSan,
        totalRecordCount: { type: 'integer' },
        area: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim'] },
        biasingProfile: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
        query: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'], exec: querySanitizationXSS },
        originalQuery: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'], exec: querySanitizationXSS },
        correctedQuery: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'], exec: querySanitizationXSS },
        warnings: {
            type: 'array',
            items: {
                type: 'string',
                maxLength: MAX_STR_LENGTH,
                rules: ['trim', 'lower'],
            },
        },
        errors: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
        template: {
            type: 'object',
            strict: true,
            properties: {
                name: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                ruleName: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                _id: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
            },
        },
        pageInfo: {
            type: 'object',
            strict: true,
            properties: {
                recordStart: { type: 'integer' },
                recordEnd: { type: 'integer' },
            },
        },
        relatedQueries: { type: 'array', items: { maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] } },
        rewrites: { type: 'array', items: { maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] } },
        redirect: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
        siteParams: {
            type: 'array',
            items: {
                type: 'object',
                strict: true,
                properties: {
                    key: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                    value: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                },
            },
        },
        matchStrategy: {
            type: 'object',
            strict: true,
            properties: {
                name: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                rules: {
                    type: 'array',
                    items: {
                        type: 'object',
                        strict: true,
                        properties: {
                            terms: { type: 'integer' },
                            termsGreaterThan: { type: 'integer' },
                            mustMatch: { type: 'integer' },
                            percentage: { type: 'boolean' },
                        },
                    },
                },
            },
        },
        availableNavigation: searchNavigationListSan,
        selectedNavigation: searchNavigationListSan,
        records: {
            type: 'array',
            items: {
                type: 'object',
                strict: true,
                properties: {
                    allMeta: {
                        type: 'object',
                        strict: true,
                        properties: {
                            sku: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim'] },
                            productId: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim'] },
                        },
                    },
                    refinementMatches: {
                        type: 'array',
                        items: {
                            type: 'object',
                            strict: true,
                            properties: {
                                name: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                                values: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        strict: true,
                                        properties: {
                                            value: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                                            count: { type: 'integer' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    _id: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                    _u: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                    _t: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                    collection: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
                },

            },
        },
        didYouMean: { type: 'array', items: { maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] } },
        originalRequest: searchQuerySan,
    },
};

export const directSearchVal = {
    type: 'object',
    optional: false,
    strict: true,
    properties: {
        id: idVal,
        totalRecordCount: { type: 'integer', optional: false },
        area: { type: 'string', optional: true },
        biasingProfile: { type: 'string', optional: true },
        query: { type: 'string', optional: false },
        originalQuery: { type: 'string', optional: true },
        correctedQuery: { type: 'string', optional: true },
        warnings: { type: 'array', items: { type: 'string' }, optional: true },
        errors: { type: 'string', optional: true },
        template: {
            type: 'object',
            optional: true,
            strict: true,
            properties: {
                name: { type: 'string', optional: true },
                ruleName: { type: 'string', optional: true },
                _id: { type: 'string', optional: true },
            },
        },
        pageInfo: {
            type: 'object',
            optional: false,
            strict: true,
            properties: {
                recordStart: { type: 'integer', optional: false },
                recordEnd: { type: 'integer', optional: false },
            },
        },
        relatedQueries: { type: 'array', items: { type: 'string' }, optional: true },
        rewrites: { type: 'array', items: { type: 'string' }, optional: true },
        redirect: { type: 'string', optional: true },
        siteParams: {
            type: 'array',
            optional: true,
            strict: true,
            items: {
                type: 'object',
                properties: {
                    key: { type: 'string', optional: true },
                    value: { type: 'string', optional: true },
                },
            },
        },
        availableNavigation: searchNavigationListVal,
        selectedNavigation: searchNavigationListVal,
        matchStrategy: {
            type: 'object',
            optional: true,
            strict: true,
            properties: {
                name: { type: 'string', optional: true },
                rules: {
                    type: 'array',
                    optional: true,
                    items: {
                        type: 'object',
                        strict: true,
                        properties: {
                            terms: { type: 'integer', optional: true },
                            termsGreaterThan: { type: 'integer', optional: true },
                            mustMatch: { type: 'integer', optional: true },
                            percentage: { type: 'boolean', optional: true },
                        },
                    },
                },
            },
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
                            sku: { type: 'string', optional: true },
                            productId: { type: 'string', optional: true },
                        },
                    },
                    refinementMatches: {
                        type: 'array',
                        optional: true,
                        items: {
                            type: 'object',
                            strict: true,
                            properties: {
                                name: { type: 'string', optional: true },
                                values: {
                                    type: 'array',
                                    optional: true,
                                    items: {
                                        type: 'object',
                                        strict: true,
                                        properties: {
                                            value: { type: 'string', optional: true },
                                            count: { type: 'integer', optional: true },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    _id: { type: 'string', optional: true },
                    _u: { type: 'string', optional: true },
                    _t: { type: 'string', optional: true },
                    collection: { type: 'string', optional: true },
                },
            },
        },
        didYouMean: { type: 'array', items: { type: 'string' }, optional: true },
        originalRequest: searchQueryVal,
    },
};

/**
 * The data for a VariationGroup event.
 */
export interface VariationGroupEvent {
    variation: {
        type: string;
        groupName: string;
    },
    metadata?: Metadata;
}

/**
 * The sanitization code for the VariationGroup event. If you are sending a
 * beacon, you don't need to import this from your application. Import the type
 * "VariationGroupEvent" for your application.
 */
export const variationGroupEventSan = {
    type: 'object',
    properties: {
        variation: {
            type: 'object',
            strict: true,
            properties: {
                type: {
                    type: 'string',                    
                    maxLength: MAX_STR_LENGTH,
                    rules: [
                        'trim',
                    ],
                },
                groupName: {
                    type: 'string',                    
                    maxLength: MAX_STR_LENGTH,
                    rules: [
                        'trim',
                    ],
                },
            },
        },
        metadata: metadataSan,
    },
};
/**
 * Sanitization and Validation for eventCustomer
 */
export const eventCustomerSan = {
    type: 'object',
    strict: true,
    properties: {
        id: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim', 'lower'] },
        area: { type: 'string', maxLength: MAX_STR_LENGTH, rules: ['trim'], optional: false, def: 'Production' },
    },
};

export const eventCustomerVal= {
    type: 'object',
    strict: true,
    properties: {
        id: { type: 'string' },
        area: { type: 'string', optional: false },
    },
};


/**
 * The validation code for the VariationGroup event. If you are sending a
 * beacon, you don't need to import this from your application. Import the type
 * "VariationGroupEvent" for your application.
 */
export const variationGroupEventVal = {
    type: 'object',
    properties: {
        variation: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    minLength: 1,
                    optional: false,
                },
                groupName: {
                    type: 'string',
                    minLength: 1,
                    optional: false,
                },
            },
            optional: false,
        },
        metadata: metadataVal,
    },
};



