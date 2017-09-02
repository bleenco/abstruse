import { expect } from 'chai';
import { Config, parseConfig, CacheType } from '../../src/api/config';

let config: Config;

let data = {
  language: null,
  cache: null
};

describe('Common Configuration Options', () => {

  describe('Language property', () => {
    beforeEach(() => data.language = 'node_js');

    it(`should parse language from configuration file`, () => {
      const parsed = parseConfig(data);
      expect(parsed.language).to.equal('node_js');
    });

    it(`should throw an error if unknown language is specified`, () => {
      data.language = 'xmatrix';
      expect(() => parseConfig(data)).to.throw(Error);
    });

    it(`should not throw an error if null is specified`, () => {
      data.language = null;
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should not throw an error if language property doesn't exists`, () => {
      delete data.language;
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should set language to null if language property doesn't exists`, () => {
      delete data.language;
      expect(parseConfig(data).language).to.be.equal(null);
    });

    it(`should not throw an error if empty string is specified`, () => {
      data.language = '';
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should set language to null if empty string is specified`, () => {
      data.language = '';
      expect(parseConfig(data).language).to.be.equal(null);
    });
  });

  describe('OS property', () => {
    it(`should be linux if property is not set`, () => {
      const parsed = parseConfig(data);
      expect(parsed.os).to.be.equal('linux');
    });

    it(`should be linux if property is null`, () => {
      data = Object.assign(data, { os: null });
      const parsed = parseConfig(data);
      expect(parsed.os).to.be.equal('linux');
    });

    it(`should be linux if property is whatever else`, () => {
      data = Object.assign(data, { os: 'macos' });
      const parsed = parseConfig(data);
      expect(parsed.os).to.be.equal('linux');
    });
  });

  describe('Cache property', () => {
    beforeEach(() => data.cache = 'node_modules');

    it(`should not throw if property is not set`, () => {
      delete data.cache;
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should be null if property is not set`, () => {
      delete data.cache;
      const parsed = parseConfig(data);
      expect(parsed.cache).to.equal(null);
    });

    it(`should be enum specified in CacheType if only string is specified`, () => {
      Object.keys(CacheType).forEach(cacheType => {
        data.cache = cacheType;
        expect(() => parseConfig(data)).to.not.throw(Error);
      });
    });

    it(`should return array of single appropriate dir if 'bundler' is specified`, () => {
      data.cache = 'bundler';
      const parsed = parseConfig(data);
      const expected = [ { bundler: 'vendor/bundle' } ];
      expect(parsed.cache).to.deep.equal(expected);
    });

    it(`should return array of single appropriate dir if 'yarn' is specified`, () => {
      data.cache = 'yarn';
      const parsed = parseConfig(data);
      const expected = [ { yarn: '$HOME/.cache/yarn' } ];
      expect(parsed.cache).to.deep.equal(expected);
    });

    it(`should return array of single appropriate dir if 'pip' is specified`, () => {
      data.cache = 'pip';
      const parsed = parseConfig(data);
      const expected = [ { pip: '$HOME/.cache/pip' } ];
      expect(parsed.cache).to.deep.equal(expected);
    });

    it(`should return array of single appropriate dir if 'packages' is specified`, () => {
      data.cache = 'packages';
      const parsed = parseConfig(data);
      const expected = [ { packages: '$HOME/R/Library' } ];
      expect(parsed.cache).to.deep.equal(expected);
    });

    it(`should return array of single appropriate dir if 'cargo' is specified`, () => {
      data.cache = 'cargo';
      const parsed = parseConfig(data);
      const expected = [ { cargo: '$HOME/.cargo' } ];
      expect(parsed.cache).to.deep.equal(expected);
    });

    it(`should throw an error if specified string is not enum of CacheType`, () => {
      data.cache = 'xmatrix';
      expect(() => parseConfig(data)).to.throw(Error);
    });

    it(`should return appropriate array of directories if directories array is specified`, () => {
      data.cache = { directories: ['node_modules', 'vendor/packages'] };
      const parsed = parseConfig(data);
      const expected = [
        { dir: 'node_modules' },
        { dir: 'vendor/packages' }
      ];
      expect(parsed.cache).to.deep.equal(expected);
    });

    it(`should throw an error when directories property is not an array`, () => {
      data.cache = { directories: null };
      expect(() => parseConfig(data)).to.throw(Error);
    });

    it(`should throw an error when directories property is not defined`, () => {
      data.cache = {};
      expect(() => parseConfig(data)).to.throw(Error);
    });

  });

});
