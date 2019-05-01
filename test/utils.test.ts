import { expect } from 'chai';
import * as utils from '../src/utils';

(window as any) = false;
(document as any) = false;
(navigator as any) = {};
(navigator as any).appCodeName = 'Microsoft Internet Explorer';
(navigator as any).userAgent = 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)';

describe('utils tests', () => {
  describe('chunkEscapedString', () => {
    it('should divide escaped string without splitting escape sequences', () => {
      const target = '%7B%22search';

      const chunked = utils.chunkEscapedString(target, 4);
      expect(chunked.join('')).to.eql(target);
      expect(chunked[0]).to.eql('%7B');
      expect(chunked[1]).to.eql('%22s');
      expect(chunked[2]).to.eql('earc');
      expect(chunked[3]).to.eql('h');
    });
  });

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
    it('should merge two objects', () => {
      const first = {
        something: 'yo',
        else: 598,
        deep: {
          nested: '9403',
          notHere: null,
        },
      };

      const second = {
        something: 'yo',
        new: 'kjsdf',
        deep: {
          nested: 'other',
          isHere: '098098',
        },
      };

      const result = utils.merge(first, second);
      expect(result).to.eql({
        something: 'yo',
        else: 598,
        new: 'kjsdf',
        deep: {
          nested: 'other',
          isHere: '098098',
          notHere: null,
        },
      });
    });

    it('should merge more than two objects', () => {
      const first = {
        something: 'yo',
        else: 598,
        deep: {
          nested: '9403',
          notHere: null,
        },
      };

      const second = {
        something: 'yo',
        new: 'kjsdf',
        deep: {
          nested: 'other',
          isHere: '098098',
        },
      };

      const third = {
        new: 'another thing',
      };

      const result = utils.merge(first, second, third);
      expect(result).to.eql({
        something: 'yo',
        else: 598,
        new: 'another thing',
        deep: {
          nested: 'other',
          isHere: '098098',
          notHere: null,
        },
      });
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

  describe('chunkString', () => {

    it('should chunk a string into equal pieces', () => {
      const longString = 'thisIsALongStringthisIsALongStringthisIsALongStringthisIsALongStringthisIsALongString';

      const result = utils.chunkString(longString, 'thisIsALongString'.length);
      expect(result.length).to.eql(5);
      expect(result[0]).to.eql('thisIsALongString');
      expect(result[1]).to.eql('thisIsALongString');
      expect(result[2]).to.eql('thisIsALongString');
      expect(result[3]).to.eql('thisIsALongString');
      expect(result[4]).to.eql('thisIsALongString');
    });

    it('should chunk a string using an encoder that expands strings', () => {
      const s = 'AAA';
      const shortString = s.repeat(5);

      const maxLength = 6;

      const encoderStrPrefix = 'BBB';
      const encoder = (str: string) => encoderStrPrefix + str;

      const result = utils.chunkString(shortString, maxLength, encoder);

      for (const chunk of result) {
        expect(encoder(chunk).length).to.lte(maxLength);
      }
    });

    it('should chunk an empty string without throwing errors', () => {
      const shortString = '';

      const encoder = (str: string) => `BBB${str}`;

      const maxLength = 6;

      const result = utils.chunkString(shortString, maxLength, encoder);

      for (const chunk of result) {
        expect(encoder(chunk).length).to.lte(maxLength);
      }
    });

    it('should chunk a string with length 1 without throwing errors', () => {
      const shortString = '1';

      const encoder = (str: string) => `BBB${str}`;

      const maxLength = 6;

      const result = utils.chunkString(shortString, maxLength, encoder);

      for (const chunk of result) {
        expect(encoder(chunk).length).to.lte(maxLength);
      }
    });

    it('should retain the order of chunked pieces', () => {
      const fullString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

      const maxLength = 6;

      const encoderStrPrefix = '000';
      const encoder = (str: string) => encoderStrPrefix + str;

      const result = utils.chunkString(fullString, maxLength, encoder);

      for (const chunk of result) {
        expect(encoder(chunk).length).to.lte(maxLength);
      }

      expect(result.join('')).to.eql(fullString);
    });
  });

  describe('getInternetExplorerVersion', () => {
    it('should get IE version', () => {
      const appCodeName = 'Microsoft Internet Explorer';
      let userAgent = 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)';

      let version = utils.getInternetExplorerVersion(appCodeName, userAgent);
      expect(version).to.eql(8);

      userAgent = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';
      version = utils.getInternetExplorerVersion(appCodeName, userAgent);
      expect(version).to.eql(10);

      version = utils.getInternetExplorerVersion(appCodeName, {} as any);
      expect(version).to.eql(-1);
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
