import mock from 'mock-fs';
import fs from 'fs-extra';
import os from 'os';
import Authenticate from '../../src/Authenticate';
import expect from 'expect.js';

describe("Authenticate", () => {
  let authenticate;

  before(() => {
    authenticate = new Authenticate();
  })

  afterEach(mock.restore);

  describe('#getAuthKey()', () => {
    it('should throw if no auth key file exists', async () => {
      mock(); // empty file system mock
      try {
        const key = await authenticate.getAuthKey();
        expect().fail("should throw error");
      } catch (err) {
        expect(err.toString()).to.contain('does not exist');
      }
    })

    it('should throw if auth key file is malformed JSON', async () => {
      const fs = {}
      fs[os.homedir() + '/.dharma/auth.json'] =
        '{ "key": "abcdefghijklmnopqrstuvwxyz }';

      mock(fs);

      try {
        const key = await authenticate.getAuthKey();
        expect().fail("should throw error");
      } catch (err) {
        expect(err.toString()).to.contain('does not exist');
      }
    })

    it('should retrieve auth key if file exists and is sound', async () => {
      const fs = {}
      fs[os.homedir() + '/.dharma/auth.json'] =
        '{ "key": "abcdefghijklmnopqrstuvwxyz" }';

      mock(fs);

      const key = await authenticate.getAuthKey();
      expect(key).to.be("abcdefghijklmnopqrstuvwxyz");
    })
  })

  describe('#setAuthKey()', () => {
    it('should create an auth key file if none exists already', async () => {
      mock();
      const key = 'abcdefghijklmnopqrstuvwxyz'
      await authenticate.setAuthKey(key)
      const keyInSystem = await authenticate.getAuthKey();

      expect(key).to.be(keyInSystem);
    });

    it('should update an existing auth key file if one exists', async () => {
      const fs = {}
      fs[os.homedir() + '/.dharma/auth.json'] =
        '{ "key": "xyz123" }';
      mock(fs);

      const newKey = 'abcdefghijklmnopqrstuvwxyz'
      await authenticate.setAuthKey(newKey)
      const keyInSystem = await authenticate.getAuthKey();

      expect(newKey).to.be(keyInSystem);
    });
  })
})
