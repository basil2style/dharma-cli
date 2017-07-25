const VersionRegister = artifacts.require("./VersionRegister.sol");
const Loan = artifacts.require('./Loan.sol');
const Metadata = require('../ethpm.json');
import {web3, util} from './init.js';
const expect = require('expect.js');
const semver = require('semver')

contract('VersionRegister#deployed', (accounts) => {
  const localCurrentVersion = {
    major: semver.major(Metadata.version),
    minor: semver.minor(Metadata.version),
    patch: semver.patch(Metadata.version)
  };
  let deployedVersionRegister;

  it("should have the current version set correctly", async () => {
    deployedVersionRegister = await VersionRegister.deployed();
    const currentVersion = await deployedVersionRegister.currentVersion.call();
    expect(currentVersion[0].equals(localCurrentVersion.major)).to.be(true);
    expect(currentVersion[1].equals(localCurrentVersion.minor)).to.be(true);
    expect(currentVersion[2].equals(localCurrentVersion.patch)).to.be(true);
  })

  it("should have the current loan contract address set correctly", async () => {
    const address = await deployedVersionRegister.getContractByVersion.call(
      localCurrentVersion.major, localCurrentVersion.minor,
      localCurrentVersion.patch)
    expect(address).to.be(Loan.address)
  })
})

contract('VersionRegister', (accounts) => {
  const ADDR_ONE = '0xf41899f21a27d014a78c511d9eaf90d1a64146ae';
  const ADDR_TWO = '0x5631c2540e97b87fc2c9f42d2af2244f2f4e034f';
  const MALICIOUS_ADDR = '0xab7c74abC0C4d48d1bdad5DCB26153FC8780f83E';

  let versionRegister;

  it("should deploy without failing", async () => {
    versionRegister = await VersionRegister.new({ from: accounts[0] })
  })

  it("should allow owner to update contract version mapping", async () => {
    const versionOne = {
      major: 0,
      minor: 1,
      patch: 0
    }
    const versionTwo = {
      major: 0,
      minor: 1,
      patch: 1
    }

    await versionRegister.updateVersionMapping(versionOne.major,
      versionOne.minor, versionOne.patch, ADDR_ONE)
    const addressOne = await versionRegister.getContractByVersion.call(
      versionOne.major, versionOne.minor, versionOne.patch);
    expect(addressOne).to.be(ADDR_ONE);

    await versionRegister.updateVersionMapping(versionTwo.major,
      versionTwo.minor, versionTwo.patch, ADDR_TWO);
    const addressTwo = await versionRegister.getContractByVersion.call(
      versionTwo.major, versionTwo.minor, versionTwo.patch);
    expect(addressTwo).to.be(ADDR_TWO);
  });

  it("should not allow non-owner to update contract version mapping", async () => {
    const maliciousVersion = {
      major: 0,
      minor: 1,
      patch: 1
    }
    try {
      await versionRegister.updateVersionMapping(
        maliciousVersion.major, maliciousVersion.minor, maliciousVersion.patch,
        MALICIOUS_ADDR,
        { from: accounts[1] }
      )
      expect().fail("should throw error")
    } catch (err) {
      util.assertThrowMessage(err)
    }
  })

  it("should allow the owner to update the current version", async () => {
    const currentVersion = {
      major: 1,
      minor: 3,
      patch: 42
    }
    await versionRegister.updateCurrentVersion(currentVersion.major,
      currentVersion.minor, currentVersion.patch)
    const remoteVersion = await versionRegister.currentVersion.call();
    expect(remoteVersion[0].equals(currentVersion.major)).to.be(true);
    expect(remoteVersion[1].equals(currentVersion.minor)).to.be(true);
    expect(remoteVersion[2].equals(currentVersion.patch)).to.be(true);
  })

  it('should not allot non-owner to update the current version', async () => {
    const maliciousVersion = {
      major: 0,
      minor: 1,
      patch: 1
    };
    try {
      await versionRegister.updateCurrentVersion(maliciousVersion.major,
        maliciousVersion.minor, maliciousVersion.patch, { from: accounts[2] })
      expect().fail("should throw error");
    } catch (err) {
      util.assertThrowMessage(err);
    }
  });
});
