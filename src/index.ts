/**
 * This file contains the constructor for the full tracker.
 */

import inspector from 'schema-inspector';
import addToCart from './schemas/addToCart';
import viewCart from './schemas/viewCart';
import removeFromCart from './schemas/removeFromCart';
import order from './schemas/order';
import autoSearch from './schemas/autoSearch';
import autoMoreRefinements from './schemas/autoMoreRefinements';
import search from './schemas/search';
import viewProduct from './schemas/viewProduct';

import { TrackerCore, AnySendableEvent, Schemas } from './core';
import { variationGroupEventSan, variationGroupEventVal } from './models';

/**
 * The origin the event. Each property is optional but one of them must be set
 * to true so that GroupBy systems know the origin.
 */
export interface SendableOrigin {
    sayt?: boolean;
    dym?: boolean;
    search?: boolean;
    recommendations?: boolean;
    autosearch?: boolean;
    navigation?: boolean;
    collectionSwitcher?: boolean;
}

export type SanitizeEventFn = (event: AnySendableEvent, schema?: any) => any;



const SCHEMAS: Schemas = {
    addToCart: {
        sanitization: addToCart.sanitization,
        validation: addToCart.validation,
    },
    viewCart: {
        sanitization: viewCart.sanitization,
        validation: viewCart.validation,
    },
    removeFromCart: {
        sanitization: removeFromCart.sanitization,
        validation: removeFromCart.validation,
    },
    order: {
        sanitization: order.sanitization,
        validation: order.validation,
    },
    autoSearch: {
        sanitization: autoSearch.sanitization,
        validation: autoSearch.validation,
    },
    autoMoreRefinements: {
        sanitization: autoMoreRefinements.sanitization,
        validation: autoMoreRefinements.validation,
    },
    search: {
        sanitization: search.sanitization,
        validation: search.validation,
    },
    viewProduct: {
        sanitization: viewProduct.sanitization,
        validation: viewProduct.validation,
    },
    variationGroup: {
        sanitization: variationGroupEventSan,
        validation: variationGroupEventVal,
    }
};

/**
 * Based on the schema provided, sanitize the event
 * @param event
 * @param sanitization
 */
const sanitizeEvent: SanitizeEventFn = (event, sanitization) => {
    inspector.sanitize(sanitization, event);
};

// Full variant has sanitization and validation.
module.exports = TrackerCore(SCHEMAS, sanitizeEvent);
