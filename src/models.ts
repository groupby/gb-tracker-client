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
    cartType?: string;
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
 * The data for a Impression event.
 */
export interface ImpressionEvent extends BaseEvent {
    impressionType: "search"|"recommendation";
    product: Product;
}
