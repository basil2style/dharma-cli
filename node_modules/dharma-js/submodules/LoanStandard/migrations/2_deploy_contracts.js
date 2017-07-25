var VersionRegister = artifacts.require('./VersionRegister.sol')
var SafeMath = artifacts.require('./SafeMath.sol');
var RedeemableTokenLib = artifacts.require("./RedeemableTokenLib.sol");
var LoanLib = artifacts.require('./LoanLib.sol');
var Loan = artifacts.require("./Loan.sol");
var Metadata = require("../ethpm.json");
var semver = require('semver');

module.exports = function(deployer, network, accounts) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, RedeemableTokenLib);
  deployer.deploy(RedeemableTokenLib);
  deployer.link(SafeMath, LoanLib);
  deployer.link(RedeemableTokenLib, LoanLib);

  deployer.deploy(LoanLib);

  deployer.link(LoanLib, Loan);
  deployer.link(RedeemableTokenLib, Loan);

  let versionRegister;
  const version = {
    major: semver.major(Metadata.version),
    minor: semver.minor(Metadata.version),
    patch: semver.patch(Metadata.version)
  }

  deployer.deploy(Loan).then(function() {
    return deployer.deploy(VersionRegister);
  }).then(function() {
    return VersionRegister.deployed();
  }).then(function(_versionRegister) {
    versionRegister = _versionRegister;
    return versionRegister.updateCurrentVersion(version.major, version.minor, version.patch)
  }).then(function(result) {
    return versionRegister.updateVersionMapping(version.major, version.minor, version.patch, Loan.address)
  });
};
