var Attestation = artifacts.require("./Attestation.sol");

module.exports = function(deployer) {
  deployer.deploy(Attestation);
};