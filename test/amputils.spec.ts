import { expect } from 'chai';
import { visitorIdFromAmpLinker } from '../src/amputils';

/**
 * Creates a mock document object for the purposes of these tests.
 * @param qsParams The query string params portion of the href for the document to create. Ex. "?hello=world".
 */
function makeDocument(qsParams: string): Document {
    return {
        location: {
            search: qsParams,
        },
    } as Document;
}

describe('visitorIdFromAmpLinker', () => {
    it('should return a visitor ID when given a visitor ID encoded in an AMP Linker value, ignoring non-GroupBy AMP Linker params', () => {
        const multipleAmpLinkerParams = {
            qsParams: '?gbi=1*1u74ubq*gbivid*LU55Q2M3TkQyT2Y2VU5rMjlNekxpMXJjQ2g0MEYtNnRjbFhoaFhzLTQ0NDVYc0pXVWhiclFvNUNUbFNUMDFjSA..&_gl=1*18t1sx1*_ga*YW1wLXR0LXVWeHEzMjFzRExFcGVuYndNQWp5bDVUbm9ZSWo0eEZqR251TkFCazBMSE5oWjVHdVZpUm9qXzJvdXpaaDM.',
            gbiVisitorId: '-NyCc7ND2Of6UNk29MzLi1rcCh40F-6tclXhhXs-4445XsJWUhbrQo5CTlST01cH',
        };

        const input = makeDocument(multipleAmpLinkerParams.qsParams);
        const expected = multipleAmpLinkerParams.gbiVisitorId;

        expect(() => {
            const visitorId = visitorIdFromAmpLinker(input);

            expect(visitorId).to.not.be.null;
            expect(visitorId).to.not.be.undefined;
            expect(visitorId).to.eql(expected);
        }).to.not.throw;
    });

    it('should return null when given a non-GroupBy AMP Linker param', () => {
        const qsParams = '?_gl=1*18t1sx1*_ga*YW1wLXR0LXVWeHEzMjFzRExFcGVuYndNQWp5bDVUbm9ZSWo0eEZqR251TkFCazBMSE5oWjVHdVZpUm9qXzJvdXpaaDM.';

        const input = makeDocument(qsParams);

        expect(() => {
            const visitorId = visitorIdFromAmpLinker(input);

            expect(visitorId).to.be.null;
        }).to.not.throw;        
    });

    it('should return null when given query string params but no AMP Linker params', () => {
        const qsParams = '?hello=world';

        const input = makeDocument(qsParams);

        expect(() => {
            const visitorId = visitorIdFromAmpLinker(input);

            expect(visitorId).to.be.null;
        }).to.not.throw;        
    });

    it('should return null when given an href "search" portion with no query string params', () => {
        const qsParams = '';

        const input = makeDocument(qsParams);

        expect(() => {
            const visitorId = visitorIdFromAmpLinker(input);

            expect(visitorId).to.be.null;
        }).to.not.throw;        
    });
});
