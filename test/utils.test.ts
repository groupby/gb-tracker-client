import { expect } from 'chai';
import * as utils from '../src/utils';

(window as any) = false;
(document as any) = false;
(navigator as any) = {};
(navigator as any).appCodeName = 'Microsoft Internet Explorer';
(navigator as any).userAgent = 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)';

describe('utils tests', () => {
  describe('startsWithOneOf', () => {
    it('returns true if array containes string starting with target', () => {
      const array = ['something', 'other', 'yo'];

      expect(utils.startsWithOneOf('y', array)).to.eql(false);
      expect(utils.startsWithOneOf('something else', array)).to.eql(true);
      expect(utils.startsWithOneOf('missing', array)).to.eql(false);
      expect(utils.startsWithOneOf('yo', array)).to.eql(true);
      expect(utils.startsWithOneOf('yo', [])).to.eql(false);
    });
  });

  describe('deepCopy', () => {
    it('should make a deep copy of an object', () => {
      const first = {
        something: 'yo',
        else: 598,
        deep: {
          nested: '9403',
          notHere: null,
        },
      };

      const second = utils.deepCopy(first);

      expect(second === first).to.eql(false);
      expect(second.deep === first.deep).to.eql(false);
      expect(first).to.eql(second);
    });

    it('should return null for deepCopy of null or undefined', () => {
      expect(utils.deepCopy(undefined)).to.eql(null);
      expect(utils.deepCopy(null)).to.eql(null);
    });
  });

  describe('visitorIdFromAmpLocationSearch', () => {
    it('should return a visitor ID from an href with a visitor ID encoded in an AMP Linker value, ignoring non-GroupBy AMP Linker params', () => {
      const search = "?gbi=1*1u74ubq*gbivid*LU55Q2M3TkQyT2Y2VU5rMjlNekxpMXJjQ2g0MEYtNnRjbFhoaFhzLTQ0NDVYc0pXVWhiclFvNUNUbFNUMDFjSA..&_gl=1*18t1sx1*_ga*YW1wLXR0LXVWeHEzMjFzRExFcGVuYndNQWp5bDVUbm9ZSWo0eEZqR251TkFCazBMSE5oWjVHdVZpUm9qXzJvdXpaaDM.";

      const visitorId = utils.visitorIdFromAmpLocationSearch(search);

      expect(visitorId).to.not.be.null;
      expect(visitorId).to.not.be.undefined;
      expect(visitorId).to.eql('-NyCc7ND2Of6UNk29MzLi1rcCh40F-6tclXhhXs-4445XsJWUhbrQo5CTlST01cH');
    });
  });

  describe('getUnique', () => {
    it('should get unique fields from an array of strings', () => {
      const someArray = [
        'this',
        'that',
        'this',
        'another',
        'something',
        'this',
      ];

      expect(utils.getUnique(someArray)).to.eql(['this', 'that', 'another', 'something']);
    });
  });
});
