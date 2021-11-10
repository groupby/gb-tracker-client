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

  describe('getApexDomain', () => {
    it('returns the appropriate value given a certain input (test table style)', () => {
      interface Input {
        location: {
          hostname: string
        }
      }

      interface TestCase {
        input: Input;
        expected: string;
      }

      const testCases: TestCase[] = [
        {
          input: { location: { hostname: 'example.com' } },
          expected: 'example.com',
        },
        {
          input: { location: { hostname: 'www.example.com' } },
          expected: 'example.com',
        },
        {
          input: { location: { hostname: 'sub.example.com' } },
          expected: 'example.com',
        },
        {
          input: { location: { hostname: 'sub1.sub2.example.com' } },
          expected: 'example.com',
        },
        {
          input: { location: { hostname: 'example.net' } },
          expected: 'example.net',
        },
        {
          input: { location: { hostname: 'localhost' } },
          expected: 'localhost',
        },
      ];
      const sut = utils.getApexDomain;

      testCases.forEach(testCase => {
        expect(sut(testCase.input as Window)).to.eql(testCase.expected);
      });
    });
  });
});
