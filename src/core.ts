import cuid from 'cuid';
import { diff } from 'deep-diff';
import cookiesjs from 'cookies-js';
import inspector from 'schema-inspector';

import {
    startsWithOneOf,
    getUnique,
    deepCopy,
} from './utils';

import {
    SanitizeEventFn,
} from './';
import { version as pkgVersion } from './version';
import {
    AddToCartEvent,
    ViewCartEvent,
    RemoveFromCartEvent,
    OrderEvent,
    SearchEvent,
    AutoSearchEvent,
    AutoMoreRefinementsEvent,
    ViewProductEvent,
    ImpressionEvent,
} from './models';
import { visitorIdFromAmpLinker } from './amputils';

// Creates a message that can be shown to a GroupBy customer implementing beacons to tell them that the beacon type they
// are trying to send has been removed.
function eventTypeRemovedMsg(eventType: string) {
    return `The ${eventType} event type has been removed. Calling this function results in no beacon being sent. The function is a no op with no performance implications. The code calling this function can be removed at a time it is convenient to do so.`;
}

interface EventCustomer {
    id: string;
    area: string;
}

/**
 * Describes the "visit" object being built up by the tracker before it is
 * sent.
 */
type InternalVisit = {
    customerData: {
        visitorId?: string;
        sessionId?: string;
        loginId?: string;
    };
}

/**
 * Describes the "visit" object after it has been built up and it is about to
 * be sent.
 */
type SendableVisit = {
    customerData: {
        visitorId: string;
        sessionId: string;
        loginId?: string;
    }
}

export type AnySendableEvent = AddToCartEvent | ViewCartEvent
    | RemoveFromCartEvent | OrderEvent | SearchEvent | AutoSearchEvent
    | AutoMoreRefinementsEvent | ViewProductEvent | ImpressionEvent;

export type FullSendableEvent = AnySendableEvent & {
    eventType: string,
    customer: EventCustomer,
    visit: SendableVisit,
    clientVersion: {
        raw: string,
    },
};

export interface Schemas {
    addToCart?: object;
    removeFromCart?: object;
    order?: object;
    autoSearch?: object;
    search?: object;
    viewProduct?: object;
    impression?: object;
}

export interface TrackerCoreFactory {
    new(schemas: Schemas, sanitizeEvent: SanitizeEventFn): TrackerFactory;
    (schemas: Schemas, sanitizeEvent: SanitizeEventFn): TrackerFactory;
}

export interface TrackerFactory {
    VERSION: string;
    new(customerId: string, area?: string, overridePixelUrl?: string | null): Tracker;
    (customerId: string, area?: string, overridePixelUrl?: string | null): Tracker;
}

export interface TrackerInternals {
    SET_FROM_COOKIES: string;
    NOT_SET_FROM_COOKIES: string;
    DEBUG_COOKIE_KEY: string;
    SESSION_COOKIE_KEY: string;
    VISITOR_COOKIE_KEY: string;
    SESSION_TIMEOUT_SEC: number;
    VERSION: string;
    VISITOR_TIMEOUT_SEC: number;
    WINDOW: Window;
    COOKIES_LIB: any;
    SCHEMAS: Schemas;
    SANITIZE_EVENT: SanitizeEventFn;
    OVERRIDEN_PIXEL_URL: string | undefined;
    CUSTOMER_ID: string;
    AREA: string;
    CUSTOMER: EventCustomer;
    VISIT: InternalVisit;
    INVALID_EVENT_CALLBACK: ((...a: any[]) => any) | undefined;
    STRICT_MODE: boolean;
    WARNINGS_DISABLED: boolean;
    VISITOR_SETTINGS_SOURCE?: string;
    IGNORED_FIELD_PREFIXES: string[];
    getProtocol(document?: { location?: { protocol?: string } }): string;
    overrideCookiesLib(cookies: any): void;
    overridePixelPath(path?: string): void;
    sendEvent(event: FullSendableEvent): void;
    prepareAndSendEvent(event: AnySendableEvent, eventType: keyof Schemas): void;
    validateEvent(event: FullSendableEvent, schemas: Schemas): { event?: FullSendableEvent, error?: any };
    getRemovedFields(sanitizedEvent: Record<any, any>, originalEvent: Record<any, any>): string[];
}

export interface Tracker {
    __getInternals: () => TrackerInternals;
    disableWarnings: () => void;
    enableWarnings: () => void;
    setVisitor: (visitorId: string, sessionId: string) => void;
    autoSetVisitor: (loginId?: string) => void;
    getVisitorId: () => void;
    getSessionId: () => void;
    getLoginId: () => void;
    setStrictMode: (strict: boolean) => void;
    prepareEvent: (event: AnySendableEvent, type: string) => FullSendableEvent;
    setInvalidEventCallback: (callback: ((...a: any[]) => any)) => void;
    sendAddToCartEvent: (event: AddToCartEvent) => void;
    sendViewCartEvent: (event: ViewCartEvent) => void;
    sendRemoveFromCartEvent: (event: RemoveFromCartEvent) => void;
    sendOrderEvent: (event: OrderEvent) => void;
    sendSearchEvent: (event: SearchEvent) => void;
    sendAutoSearchEvent: (event: AutoSearchEvent) => void;
    sendMoreRefinementsEvent: (event: AutoMoreRefinementsEvent) => void;
    sendViewProductEvent: (event: ViewProductEvent) => void;
    sendImpressionEvent: (event: ImpressionEvent) => void;
}

function TrackerCore(schemas: Schemas, sanitizeEvent: SanitizeEventFn): TrackerFactory {
    function TrackerCtr(customerId: string, area: string = 'Production', overridePixelUrl?: string): Tracker {
        // Setting up customer
        if (typeof customerId !== 'string' || customerId.length === 0) {
            throw new Error('customerId must be a string with length');
        }

        const internals: TrackerInternals = {
            SET_FROM_COOKIES: 'setFromCookies',
            NOT_SET_FROM_COOKIES: 'notSetFromCookies',
            DEBUG_COOKIE_KEY: 'gbi_debug',

            SESSION_COOKIE_KEY: 'gbi_sessionId',
            VISITOR_COOKIE_KEY: 'gbi_visitorId',
            SESSION_TIMEOUT_SEC: 30 * 60,
            VERSION: pkgVersion,
            VISITOR_TIMEOUT_SEC: 60 * 60 * 24 * 365 * 10,

            SCHEMAS: schemas,
            SANITIZE_EVENT: sanitizeEvent,

            WINDOW: window,
            COOKIES_LIB: cookiesjs,

            CUSTOMER_ID: customerId,
            AREA: area,
            CUSTOMER: {
                id: customerId,
                area,
            },
            VISIT: {
                customerData: {},
            },
            INVALID_EVENT_CALLBACK: undefined,
            STRICT_MODE: false,
            WARNINGS_DISABLED: false,
            OVERRIDEN_PIXEL_URL: overridePixelUrl,

            VISITOR_SETTINGS_SOURCE: undefined,

            IGNORED_FIELD_PREFIXES: [
                'search.records.[].allMeta',
                'search.template.zones',
            ],

            overrideCookiesLib: (cookies) => {
                internals.COOKIES_LIB = cookies;
            },

            overridePixelPath: (path) => {
                internals.OVERRIDEN_PIXEL_URL = path;
            },

            /**
             * Take event, convert to string, split by max length, and send along with uuid and customer info
             * @param event The event to send.
             */
            sendEvent: (event: any) => {
                let eventType: string;
                if (!event || !event.eventType) {
                    // This should never happen, but there's nothing we can do if it does happen, because the URL
                    // depends on the event type.
                    // No log message because we don't want to pollute logs of browser.
                    return;
                }

                eventType = event.eventType as string;

                // All event types except these are deprecated.
                if (eventType !== 'autoSearch' && eventType !== 'search' && eventType !== 'viewProduct' && eventType !== 'addToCart' && eventType !== 'removeFromCart' && eventType !== 'order' && eventType !== 'impression') {
                    console.info(eventTypeRemovedMsg(eventType));
                    return;
                }

                if ((internals.WINDOW as any).GROUPBY_BEACON_DEBUG || internals.COOKIES_LIB.get(internals.DEBUG_COOKIE_KEY)) {
                    console.log(`Beaconing event: ${JSON.stringify(event, null, 2)}`);
                }

                const protocol = internals.getProtocol(document);
                const host = `${protocol}//${customerId}.groupbycloud.com`;
                const path = `/wisdom/v2/pixel`;
                let url: string;

                if (internals.OVERRIDEN_PIXEL_URL && (typeof internals.OVERRIDEN_PIXEL_URL === 'string') && internals.OVERRIDEN_PIXEL_URL.length > 0) {
                    url = internals.OVERRIDEN_PIXEL_URL;
                } else {
                    url = host + path;
                }

                const oReq = new XMLHttpRequest();
                oReq.open("POST", url);

                // Prevent the need for CORS pre-flight OPTIONS requests by overriding Content-Type from
                // application/json to text/plain. Server understands this was done and parses accordingly.
                oReq.setRequestHeader('Content-Type', 'text/plain');

                oReq.send(JSON.stringify(event));
            },

            /**
             * Helper to prepare, validate, and send event
             * @param event
             * @param eventType
             */
            prepareAndSendEvent: (event, eventType: string) => {
                const fullEvent = that.prepareEvent(event, eventType);
                const sanitizationSchema = internals.SCHEMAS[eventType];
                const validated = internals.validateEvent(fullEvent, sanitizationSchema || {});
                if (validated && validated.event) {
                    internals.sendEvent(validated.event);
                } else {
                    if (internals.INVALID_EVENT_CALLBACK) {
                        internals.INVALID_EVENT_CALLBACK(fullEvent, validated.error);
                    }
                }
            },

            /**
             * Based on the sanitization schema provided, sanitizes an event for sending to the tracker endpoint.
             * @param event
             * @param sanitizationSchema
             */
            validateEvent: (event, sanitizationSchema) => {
                const sanitizedEvent = deepCopy(event);
                internals.SANITIZE_EVENT(sanitizedEvent, sanitizationSchema || {});

                if (!sanitizedEvent.visit) {
                    sanitizedEvent.visit = {};
                }

                if (!sanitizedEvent.visit.generated) {
                    sanitizedEvent.visit.generated = {};
                }

                const removedFields = internals.getRemovedFields(sanitizedEvent, event);

                if (removedFields.length > 0) {
                    if (internals.STRICT_MODE) {
                        throw new Error(`Unexpected fields ${JSON.stringify(removedFields)} in eventType: ${sanitizedEvent.eventType}`);
                    }

                    if (!sanitizedEvent.metadata) {
                        sanitizedEvent.metadata = [];
                    }

                    for (const removedField of removedFields) {
                        if (!internals.WARNINGS_DISABLED) {
                            console.warn(`unexpected field: ${removedField} is being dropped from eventType: ${sanitizedEvent.eventType}`);
                        }

                        sanitizedEvent.metadata.push({
                            key: 'gbi-field-warning',
                            value: removedField,
                        });
                    }
                }

                sanitizedEvent.visit.generated.uri = (typeof internals.WINDOW !== 'undefined' && internals.WINDOW.location) ? internals.WINDOW.location.href : '';
                sanitizedEvent.visit.generated.timezoneOffset = new Date().getTimezoneOffset();
                sanitizedEvent.visit.generated.localTime = new Date().toISOString();

                if (document && document.referrer) {
                    sanitizedEvent.visit.generated.referer = document.referrer;
                }

                return { event: sanitizedEvent };
            },

            /**
             * Compared the sanitized event to the original, and return an object containing the properties that were removed.
             * @param sanitizedEvent
             * @param originalEvent
             * @returns {*}
             */
            getRemovedFields: (sanitizedEvent, originalEvent) => {
                const allDifferences = diff(sanitizedEvent, originalEvent);
                const removedFields: string[] = [];

                if (!allDifferences) {
                    return removedFields;
                }

                for (const difference of allDifferences) {
                    if (!difference || !difference.path) {
                        continue;
                    }

                    for (let j = 0; j < difference.path.length; j++) {
                        if (typeof difference.path[j] === 'number') {
                            // Remove array indices
                            difference.path[j] = '[]';
                        }
                    }

                    if (difference.kind === 'N') {
                        if (!difference.path) {
                            continue;
                        }
                        const fieldName = difference.path.join('.');

                        if (!startsWithOneOf(fieldName, internals.IGNORED_FIELD_PREFIXES)) {
                            removedFields.push(fieldName);
                        }
                    }
                }

                return getUnique(removedFields);
            },

            getProtocol: (document) => {
                const protocol = document && document.location && document.location.protocol;

                // Only allowed protocols. Default to https
                if (protocol !== 'http:' && protocol !== 'https:') {
                    return 'https:';
                }

                return protocol;
            },
        };

        const that: Tracker = {
            __getInternals: () => internals,

            disableWarnings: () => {
                internals.WARNINGS_DISABLED = true;
            },

            enableWarnings: () => {
                internals.WARNINGS_DISABLED = false;
            },

            /**
             * Update visitor and session id's during login/logout
             * @param visitorId
             * @param sessionId
             */
            setVisitor: (visitorId, sessionId) => {
                if (internals.VISITOR_SETTINGS_SOURCE && internals.VISITOR_SETTINGS_SOURCE !== internals.NOT_SET_FROM_COOKIES) {
                    console.log('visitorId and sessionId already set using autoSetVisitor(). Ignoring setVisitor()');
                    return;
                }

                internals.VISITOR_SETTINGS_SOURCE = internals.NOT_SET_FROM_COOKIES;

                visitorId = (visitorId && typeof visitorId === 'number') ? (`${visitorId}`) : visitorId;
                sessionId = (sessionId && typeof sessionId === 'number') ? (`${sessionId}`) : sessionId;

                if (typeof visitorId !== 'string' || visitorId.length === 0) {
                    throw new Error('visitorId must be a string with length');
                }

                if (typeof sessionId !== 'string' || sessionId.length === 0) {
                    throw new Error('sessionId must be a string with length');
                }

                internals.VISIT.customerData.visitorId = visitorId;
                internals.VISIT.customerData.sessionId = sessionId;
            },

            /**
             * Initialize visitor data. Uses the following sources in this
             * order:
             * - AMP Linker param "gbi" (and sets this in 1st-party cookie)
             * - 1st-party cookies
             * - generated within this code (and sets this in 1st-party cookie)
             * @param loginId The optional login ID for the shopper.
             */
            autoSetVisitor: (loginId) => {
                if (internals.VISITOR_SETTINGS_SOURCE && internals.VISITOR_SETTINGS_SOURCE !== internals.SET_FROM_COOKIES) {
                    console.log('visitorId and sessionId already set using setVisitor(). Overriding setVisitor()');
                }

                if (loginId && typeof loginId !== 'string') {
                    throw new Error('if loginId is provided, it must be a string');
                }

                internals.VISITOR_SETTINGS_SOURCE = internals.SET_FROM_COOKIES;

                if (loginId && loginId.length > 0) {
                    internals.VISIT.customerData.loginId = loginId;
                } else {
                    delete internals.VISIT.customerData.loginId;
                }

                internals.VISIT.customerData.sessionId = internals.COOKIES_LIB.get(internals.SESSION_COOKIE_KEY);

                // Check for AMP Linker param for visitor ID:   
                internals.VISIT.customerData.visitorId = visitorIdFromAmpLinker(internals.WINDOW.document);

                const noVisitorSet = () => {
                    return !internals.VISIT.customerData.visitorId || internals.VISIT.customerData.visitorId.length < 1;
                };

                // Fall back to visitor ID from cookie if no visitor ID from AMP Linker.
                if (noVisitorSet()) {
                    internals.VISIT.customerData.visitorId = internals.COOKIES_LIB.get(internals.VISITOR_COOKIE_KEY);
                }

                if (!internals.VISIT.customerData.sessionId || internals.VISIT.customerData.sessionId.length < 1) {
                    internals.VISIT.customerData.sessionId = cuid();
                }
                internals.COOKIES_LIB.set(internals.SESSION_COOKIE_KEY, internals.VISIT.customerData.sessionId, { expires: internals.SESSION_TIMEOUT_SEC });

                // Fall back to visitor ID from new generated ID if no visitor ID from AMP Linker or cookie.
                if (noVisitorSet()) {
                    internals.VISIT.customerData.visitorId = cuid();
                }

                // Set cookie for visitor ID. This resets the expiry time if it
                // was a cookie already set before.
                internals.COOKIES_LIB.set(internals.VISITOR_COOKIE_KEY, internals.VISIT.customerData.visitorId, { expires: internals.VISITOR_TIMEOUT_SEC });
            },

            getVisitorId: () => {
                return internals.VISIT.customerData.visitorId;
            },

            getSessionId: () => {
                return internals.VISIT.customerData.sessionId;
            },

            getLoginId: () => {
                return internals.VISIT.customerData.loginId;
            },

            setStrictMode: (strict: boolean) => {
                internals.STRICT_MODE = strict;
            },

            /**
             * Append eventType, customer, and visit to event
             * @param event
             * @param type
             */
            prepareEvent: (event, type) => {
                // Continuously initialize visitor info in order to keep sessionId from expiring
                if (internals.VISITOR_SETTINGS_SOURCE === internals.SET_FROM_COOKIES) {
                    that.autoSetVisitor(internals.VISIT.customerData.loginId);
                }

                if (!internals.VISIT.customerData.sessionId || !internals.VISIT.customerData.visitorId) {
                    throw new Error('call autoSetVisitor() at least once before an event is sent');
                }

                (event as FullSendableEvent).clientVersion = { raw: internals.VERSION };
                (event as FullSendableEvent).eventType = type;
                (event as FullSendableEvent).customer = internals.CUSTOMER;
                (event as FullSendableEvent).visit = internals.VISIT as SendableVisit;
                return event as FullSendableEvent;
            },

            /**
             * Set callback to be notified of invalid events
             * @param callback
             */
            setInvalidEventCallback: (callback) => {
                if (typeof callback !== 'function') {
                    throw new Error('invalid event callback must be a function');
                }

                internals.INVALID_EVENT_CALLBACK = callback;
            },

            /**
             * Validate and send addToCart event
             * @param event
             */
            sendAddToCartEvent: (event: AddToCartEvent) => {
                internals.prepareAndSendEvent(event, 'addToCart');
            },

            /**
             * Validate and send viewCart event
             * DEPRECATED. This code does nothing now.
             * @param event
             */
            sendViewCartEvent: (event: ViewCartEvent) => {
                // Event type deprecated.
            },

            /**
             * Validate and send removeFromCart event
             * @param event
             */
            sendRemoveFromCartEvent: (event: RemoveFromCartEvent) => {
                internals.prepareAndSendEvent(event, 'removeFromCart');
            },

            /**
             * Validate and send order event
             * @param event
             */
            sendOrderEvent: (event: OrderEvent) => {
                internals.prepareAndSendEvent(event, 'order');
            },

            /**
             * Validate and send search event
             * @param event
             */
            sendSearchEvent: (event: SearchEvent) => {
                internals.prepareAndSendEvent(event, 'search');
            },

            /**
             * Validate and send search event
             * @param event
             */
            sendAutoSearchEvent: (event: AutoSearchEvent) => {
                internals.prepareAndSendEvent(event, 'autoSearch');
            },

            /**
             * Validate and send moreRefinements event.
             * DEPRECATED. This code does nothing now.
             * @param event
             */
            sendMoreRefinementsEvent: (_: AutoMoreRefinementsEvent) => {
                // Event type deprecated.
            },

            /**
             * Validate and send viewProduct event
             * @param event
             */
            sendViewProductEvent: (event: ViewProductEvent) => {
                internals.prepareAndSendEvent(event, 'viewProduct');
            },

            /**
             * Validate and send Impression event
             * @param event
             */

            sendImpressionEvent: (event: ImpressionEvent) => {
                internals.prepareAndSendEvent(event, 'impression');
            },
        };

        return that;
    }

    TrackerCtr.VERSION = pkgVersion;
    return TrackerCtr as TrackerFactory;
}

const TrackerCoreFinal = TrackerCore as TrackerCoreFactory;

export {
    TrackerCoreFinal as TrackerCore,
};
