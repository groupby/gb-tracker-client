import { MAX_STR_LENGTH } from './schemas/utils';

/**
 * Metadata that can be attached to any event, and often to partials within
 * each event (for example, metadata for an event can be "gbi:true" and
 * metadata for a product can be "summersale2020:true"). Metadata is never
 * required except for certain situations such as comparing GroupBy Search vs.
 * non-GroupBy Search, or custom solutions created with help from a GroupBy
 * Customer's TC on the Customer Success team.
 */
type Metadata = {
    key: string,
    value: string
}[];

interface AutoMoreRefinementsPartial {
    id: string;
}

interface Item {
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

interface Cart {
    id?: string;
    items: Item[];
    metadata?: Metadata;
}

interface SearchNavigation {
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

type SearchNavigationList = SearchNavigation[];

interface SearchQuery {
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

interface DirectSearchPartial {
    id: string;
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

interface Product {
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

/**
 * Used for A/B testing experiments.
 */
interface Experiment {
    experimentId: string;
    experimentVariant: string;
}

/**
 * The base event. All event types support optional experiment tracking and
 * event-level metadata.
 */
interface BaseEvent {
    experiments?: Experiment[];
    metadata?: Metadata;
}

/**
 * The base cart type event.
 */
interface BaseCartEvent extends BaseEvent {
    cart: Cart;
}

/**
 * The data for an AddToCart event.
 */
export interface AddToCartEvent extends BaseCartEvent { }

/**
 * The data for a ViewCart event.
 */
export interface ViewCartEvent extends BaseCartEvent { }

/**
 * The data for a RemoveFromCart event.
 */
export interface RemoveFromCartEvent extends BaseCartEvent { };

/**
 * The data for an Order event.
 */
export interface OrderEvent extends BaseCartEvent { };

/**
 * The data for a Search event. This should be used only until you are
 * using only GroupBy Search, at which point you should only beacon the
 * AutoSearch event because it is less error prone and more effient. See
 * AutoSearch for more info.
 */
export interface SearchEvent extends BaseEvent {
    search: DirectSearchPartial & {
        origin: SendableOrigin;
    };
}

/**
 * The data for an AutoSearch event. AutoSearch should be used instead of
 * Search once you have moved all of your search usage to GroupBy Search. It is
 * more efficient than using the Search event because you are not required to
 * include all the data from the search results in the function call. Instead,
 * you include the search ID and GroupBy joins the search results with the
 * search ID in the AutoSearch event. This is less error prone and results in
 * less data being uploaded from the shopper's web browser to GroupBy for each
 * beacon.
 */
export interface AutoSearchEvent extends BaseEvent {
    search: {
        id: string;
        origin: SendableOrigin;
    };
}

/**
 * The data for an AutoMoreRefinements event.
 */
export interface AutoMoreRefinementsEvent extends BaseEvent {
    moreRefinements: AutoMoreRefinementsPartial;
}

/**
 * The data for a ViewProduct event.
 */
export interface ViewProductEvent extends BaseEvent {
    product: Product;
}

/**
 * metadata Sanitzation and Validation
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
 * 
 * @deprecated since version 3.9.0
 */

/**
 * The data for a VariationGroup event.
 * @deprecated since version 3.9.0
 */
export interface VariationGroupEvent extends BaseEvent {
    variation: {
        type: string;
        groupName: string;
    },
}

/**
 * The sanitization code for the VariationGroup event. If you are sending a
 * beacon, you don't need to import this from your application. Import the type
 * "VariationGroupEvent" for your application. * 
 * @deprecated since version 3.9.0
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
 * The validation code for the VariationGroup event. If you are sending a
 * beacon, you don't need to import this from your application. Import the type
 * "VariationGroupEvent" for your application. * 
 * @deprecated since version 3.9.0
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