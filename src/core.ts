import cuid from 'cuid';
import { diff } from 'deep-diff';
import cookiesjs from 'cookies-js';
import inspector from 'schema-inspector';
import LZString from 'lz-string';

import {
    chunkString,
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
    EventSegment,
} from './models';
import { EventCustomer } from '@groupby/beacon-models/partials/customer';

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

export type AnySendableEvent = AddToCartEvent | ViewCartEvent |
    RemoveFromCartEvent | OrderEvent | SearchEvent |
    AutoSearchEvent | AutoMoreRefinementsEvent | ViewProductEvent;

export type FullSendableEvent = AnySendableEvent & {
    eventType: string,
    customer: EventCustomer,
    visit: SendableVisit,
    clientVersion: {
        raw: string,
    },
};

export interface Schemas {
    addToCart?: { validation?: object, sanitization?: object };
    viewCart?: { validation?: object, sanitization?: object };
    removeFromCart?: { validation?: object, sanitization?: object };
    order?: { validation?: object, sanitization?: object };
    autoSearch?: { validation?: object, sanitization?: object };
    autoMoreRefinements?: { validation?: object, sanitization?: object };
    search?: { validation?: object, sanitization?: object };
    viewProduct?: { validation?: object, sanitization?: object };
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
    MAX_SEGMENT_COUNT: number;
    MAX_PATH_LENGTH: number;
    MAX_PATHNAME_LENGTH: number;
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
    MAX_QUERY_STRING_LENGTH: number;
    IGNORED_FIELD_PREFIXES: string[];
    overrideCookiesLib(cookies: any): void;
    overridePixelPath(path?: string): void;
    sendEvent(event: FullSendableEvent, sendSegment: (segment: EventSegment) => void): void;
    prepareAndSendEvent(event: AnySendableEvent, eventType: keyof Schemas): void;
    validateEvent(event: FullSendableEvent, schemas: { validation?: any, sanitization?: any }): { event?: FullSendableEvent, error?: any };
    getRemovedFields(sanitizedEvent: Record<any, any>, originalEvent: Record<any, any>): string[];
    sendSegment(segment: EventSegment): void;
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
}

function TrackerCore(schemas: Schemas, sanitizeEvent: SanitizeEventFn): TrackerFactory {
    const __MAX_PATH_LENGTH = 4000; // Thanks NGINX
    const __MAX_PATHNAME_LENGTH = 100; // '/v2/pixel/?random=0.5405421565044588&m=' plus extra for luck

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
            MAX_SEGMENT_COUNT: 100,

            SCHEMAS: schemas,
            SANITIZE_EVENT: sanitizeEvent,

            // Info on path length limitations: http://stackoverflow.com/a/812962
            MAX_PATH_LENGTH: __MAX_PATH_LENGTH, // Thanks NGINX
            MAX_PATHNAME_LENGTH: __MAX_PATHNAME_LENGTH, // '/v2/pixel/?random=0.5405421565044588&m=' plus extra for luck

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

            MAX_QUERY_STRING_LENGTH: __MAX_PATH_LENGTH - __MAX_PATHNAME_LENGTH,

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
             * @param event
             * @param sendSegment
             */
            sendEvent: (event, sendSegment) => {
                if (event && event.eventType === 'sessionChange') {
                    // This event is deprecated
                    return;
                }

                const eventString = JSON.stringify(event);
                const uuidString = cuid();

                const segmentTemplate = {
                    uuid: uuidString,
                    id: internals.MAX_SEGMENT_COUNT,
                    total: internals.MAX_SEGMENT_COUNT,
                    customer: event.customer,
                    clientVersion: internals.VERSION,
                };

                const SEGMENT_WRAPPER_OVERHEAD = encodeURIComponent(JSON.stringify(segmentTemplate)).length;

                // Double encode here to account for double-encoding at the end
                const eventStringSegments = chunkString(eventString, internals.MAX_QUERY_STRING_LENGTH - SEGMENT_WRAPPER_OVERHEAD, LZString.compressToEncodedURIComponent);

                if (eventStringSegments.length > internals.MAX_SEGMENT_COUNT) {
                    console.error(`cannot send: ${eventStringSegments} event segments, as that exceeds the max of: ${internals.MAX_SEGMENT_COUNT}`);
                    return;
                }

                if ((window as any).DEBUG || internals.COOKIES_LIB.get(internals.DEBUG_COOKIE_KEY)) {
                    console.log(`Beaconing event: ${JSON.stringify(event, null, 2)}`);
                }

                for (let i = 0; i < eventStringSegments.length; i++) {
                    sendSegment({
                        uuid: uuidString,
                        segment: LZString.compressToEncodedURIComponent(eventStringSegments[i]), // To prevent double-encoding, it'll be re-encoded before sending
                        id: i,
                        total: eventStringSegments.length,
                        customer: event.customer,
                        clientVersion: internals.VERSION,
                    });
                }
            },

            /**
             * Helper to prepare, validate, and send event
             * @param event
             * @param eventType
             */
            prepareAndSendEvent: (event, eventType: string) => {
                const fullEvent = that.prepareEvent(event, eventType);
                const schema = internals.SCHEMAS[eventType];
                const validated = internals.validateEvent(fullEvent, schema || {});
                if (validated && validated.event) {
                    internals.sendEvent(validated.event, internals.sendSegment);
                } else {
                    if (internals.INVALID_EVENT_CALLBACK) {
                        internals.INVALID_EVENT_CALLBACK(fullEvent, validated.error);
                    }
                }
            },

            /**
             * Based on the schema provided, validate an event for sending to the tracker endpoint
             * @param event
             * @param eventSchemas
             */
            validateEvent: (event, eventSchemas) => {
                const sanitizedEvent = deepCopy(event);
                internals.SANITIZE_EVENT(sanitizedEvent, eventSchemas.sanitization || {});
                const result = inspector.validate(eventSchemas.validation || {}, sanitizedEvent);

                if (!result.valid) {
                    console.error(`error while processing event: ${result.format()}`);
                    return {
                        event: undefined,
                        error: result.format(),
                    };
                }

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

                sanitizedEvent.visit.generated.uri = (typeof window !== 'undefined' && window.location) ? window.location.href : '';
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

            /**
             * Use pixel endpoint to upload string to event-tracker
             * @param segment
             */
            sendSegment: (segment) => {
                const protocol = (document && document.location && document.location.protocol) || 'https';
                const host = `${protocol}//${customerId}.groupbycloud.com`;
                let params = `?random\x3d${Math.random()}`; // To bust the cache
                params += `&m=${encodeURIComponent(JSON.stringify(segment))}`;

                const path = `/wisdom/v2/pixel/${params}`;

                if (path.length > internals.MAX_PATH_LENGTH) {
                    console.error(`cannot send request with path exceeding max length of: ${internals.MAX_PATH_LENGTH} path is: ${path.length}`);
                    return;
                }

                const im = new Image();
                if (internals.OVERRIDEN_PIXEL_URL && (typeof internals.OVERRIDEN_PIXEL_URL === 'string') && internals.OVERRIDEN_PIXEL_URL.length > 0) {
                    im.src = internals.OVERRIDEN_PIXEL_URL + params;
                } else {
                    im.src = host + path;
                }
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
             * Initialize visitor data from cookies, or create those cookies if they do not exist
             * @param loginId
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
                internals.VISIT.customerData.visitorId = internals.COOKIES_LIB.get(internals.VISITOR_COOKIE_KEY);

                if (!internals.VISIT.customerData.sessionId || internals.VISIT.customerData.sessionId.length < 1) {
                    internals.VISIT.customerData.sessionId = cuid();
                }
                internals.COOKIES_LIB.set(internals.SESSION_COOKIE_KEY, internals.VISIT.customerData.sessionId, { expires: internals.SESSION_TIMEOUT_SEC });

                if (!internals.VISIT.customerData.visitorId || internals.VISIT.customerData.visitorId.length < 1) {
                    internals.VISIT.customerData.visitorId = cuid();
                }
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
             * @param event
             */
            sendViewCartEvent: (event: ViewCartEvent) => {
                internals.prepareAndSendEvent(event, 'viewCart');
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
             * Validate and send moreRefinements event
             * @param event
             */
            sendMoreRefinementsEvent: (event: AutoMoreRefinementsEvent) => {
                internals.prepareAndSendEvent(event, 'autoMoreRefinements');
            },

            /**
             * Validate and send viewProduct event
             * @param event
             */
            sendViewProductEvent: (event: ViewProductEvent) => {
                internals.prepareAndSendEvent(event, 'viewProduct');
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