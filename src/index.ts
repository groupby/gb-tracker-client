/**
 * This file contains the constructor for the full tracker.
 */

import inspector from 'schema-inspector';
import addToCart from './schemas/addToCart';
import removeFromCart from './schemas/removeFromCart';
import order from './schemas/order';
import autoSearch from './schemas/autoSearch';
import search from './schemas/search';
import viewProduct from './schemas/viewProduct';
import impression from './schemas/impression';

import { TrackerCore, AnySendableEvent, Schemas, TrackerFactory } from './core';

namespace GbTracker {
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
}

/**
 * Sanitization schemas used to transform the data the customer calls the event sending functions with.
 */
const SCHEMAS: Schemas = {
    addToCart: addToCart.sanitization,
    autoSearch: autoSearch.sanitization,
    impression: impression.sanitization,
    order: order.sanitization,
    removeFromCart: removeFromCart.sanitization,
    search: {
        sanitization: search.sanitization,
        validation: search.validation,
    },
    viewProduct: viewProduct.sanitization,
};

/**
 * Based on the schema provided, sanitize the event
 * @param event
 * @param sanitization
 */
const sanitizeEvent: GbTracker.SanitizeEventFn = (event, sanitization) => {
    inspector.sanitize(sanitization, event);
};

// Full variant has sanitization and validation.
const GbTracker: TrackerFactory = TrackerCore(SCHEMAS, sanitizeEvent);
export = GbTracker;
