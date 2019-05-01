/**
 * This file contains the constructor for the slim tracker.
 */

import { SanitizeEventFn, SendableOrigin } from '.';

import {
    Search,
} from '@groupby/beacon-models/search';

import { TrackerCore } from './core';

import addToCart from './schemas/addToCart-validate';
import viewCart from './schemas/viewCart-validate';
import removeFromCart from './schemas/removeFromCart-validate';
import order from './schemas/order-validate';
import autoSearch from './schemas/autoSearch-validate';
import autoMoreRefinements from './schemas/autoMoreRefinements-validate';
import search from './schemas/search-validate';
import viewProduct from './schemas/viewProduct-validate';

/**
 * Based on the schema provided, sanitize the event
 * @param event
 */
const sanitizeEvent: SanitizeEventFn = (event) => {

    // Making sure all fields of origin are set
    if ((event as Search).search) {
        const searchEvent = event as Search;
        const origin = {
            sayt: false,
            dym: false,
            search: false,
            recommendations: false,
            autosearch: false,
            navigation: false,
            collectionSwitcher: false,
        };

        if (searchEvent.search.origin) {
            for (const k of Object.keys(searchEvent.search.origin)) {
                const key = k as keyof SendableOrigin;
                (origin as any)[key] = (searchEvent.search.origin as any)[key];
            }
        }
        searchEvent.search.origin = origin;

        if (searchEvent.search.query) {
            searchEvent.search.query = searchEvent.search.query.replace(/<|>/g, '').trim();
        }
    }
};

// Only use the validation portion of the generated schemas to keep the bundle
// size down.
const SCHEMAS = {
    addToCart: {
        validation: addToCart.validation,
    },
    viewCart: {
        validation: viewCart.validation,
    },
    removeFromCart: {
        validation: removeFromCart.validation,
    },
    order: {
        validation: order.validation,
    },
    autoSearch: {
        validation: autoSearch.validation,
    },
    autoMoreRefinements: {
        validation: autoMoreRefinements.validation,
    },
    search: {
        validation: search.validation,
    },
    viewProduct: {
        validation: viewProduct.validation,
    }
};

// Slim variant has only validation.
module.exports = TrackerCore(SCHEMAS, sanitizeEvent);
