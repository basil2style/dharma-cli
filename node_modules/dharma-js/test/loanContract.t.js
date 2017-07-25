import LoanContract from '../lib/contract_wrappers/LoanContract'
import Metadata from '../package.json';
import expect from 'expect.js';
import {web3} from './init.js';
import semver from 'semver';

describe('LoanContract', function() {
  it("should instantiate w/o throwing if version is current", async function() {
    await LoanContract.instantiate(web3)
  })

  it("should throw when instantiating with version mismatched to contract", async function() {
    let outdatedMetadata = Object.assign({}, Metadata);
    const major = semver.major(Metadata.version);
    const minor = semver.minor(Metadata.version);
    const patch = semver.patch(Metadata.version) + 1;
    outdatedMetadata.version = major + '.' + minor + '.' + patch;

    try {
      await LoanContract.instantiate(web3, outdatedMetadata)
      expect().fail("should throw error");
    } catch (err) {
      expect(err.toString().indexOf('deprecated version') > -1).to.be(true);
    }
  })
})
