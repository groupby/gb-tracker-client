/**
 * This file contains types exported for consuming libraries. Normally this
 * would be exported from the library root, but for legacy reasons, the full
 * tracker is currently exported from the library root. Therefore, consumers
 * importing from the library root will have a large bundle size. Therefore,
 * the types are here instead so that consumers can import them without causing
 * a large bundle size.
 */

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
