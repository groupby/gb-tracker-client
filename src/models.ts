/**
 * This file contains types exported for consuming libraries. Normally this
 * would be exported from the library root, but for legacy reasons, the full
 * tracker is currently exported from the library root. Therefore, consumers
 * importing from the library root will have a large bundle size. Therefore,
 * the types are here instead so that consumers can import them without causing
 * a large bundle size.
 */

import {
    MAX_STR_LENGTH,
} from '@groupby/beacon-models/constants';

import {
    sanitization as metadataSan,
    validation as metadataVal,
} from '@groupby/beacon-models/partials/metadata/schema';

import {
    AutoMoreRefinements as AutoMoreRefinementsPartial,
} from '@groupby/beacon-models/partials/autoMoreRefinements';
import {
    Cart,
} from '@groupby/beacon-models/partials/cart';
import {
    DirectSearch as DirectSearchPartial,
} from '@groupby/beacon-models/partials/directSearch';
import {
    EventCustomer,
} from '@groupby/beacon-models/partials/customer';
import {
    Product,
} from '@groupby/beacon-models/partials/product';
import { Metadata } from '@groupby/beacon-models/partials/metadata';

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
