const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect, assert } = require("chai");
const { keccak256, hexlify } = require("ethers");
const { ethers } = require("hardhat");

describe("Proxy", function () {

  async function deployProxyFixture() {
    const Proxy = await ethers.getContractFactory("Proxy");
    const proxy = await Proxy.deploy();

    const Logic1 = await ethers.getContractFactory("Logic1");
    const logic1 = await Logic1.deploy();

    const Logic2 = await ethers.getContractFactory("Logic2");
    const logic2 = await Logic2.deploy();

    // new ethers.utils.Interface("function changeX(uint) external");

    await proxy.waitForDeployment();
    await logic1.waitForDeployment();
    await logic2.waitForDeployment();

    console.log("Proxy Deployed:", proxy.target);
    console.log("Logic1 Deployed:", logic1.target);
    console.log("Logic2 Deployed:", logic2.target);

    const proxyAsLogic1 = await ethers.getContractAt("Logic1", proxy.target);
    const proxyAsLogic2 = await ethers.getContractAt("Logic2", proxy.target);

    console.log("Proxy as logic1:", proxyAsLogic1.target);
    console.log("Proxy as logic2:", proxyAsLogic2.target);

    return { proxy, proxyAsLogic1, proxyAsLogic2, logic1, logic2 };
  }

  function to64Hex(v) {
    const value = ((v) => {
      switch (typeof v) {
        case "number":
          return v.toString(16);
        case "bigint":
          return v.toString(16);
        case "string":
          return v.startsWith("0x") ? v.replace("x", "0") : v
            .split("")
            .map(v => v.charCodeAt().toString(16))
            .reduce((a, c) => a + "" + c);
        default:
          return "" + v;
      }
    })(v);

    return "0x" + Array(64 - value.length)
      .fill("0")
      .concat(
        value.toLowerCase().replace("0x", "").split("")
      )
      .reduce((a, c) => a + "" + c)
  }

  async function lookupAt(contractAddr, slot, value) {
    const result = await ethers.provider.getStorage(contractAddr, slot);
    const slotKey = to64Hex(value);

    // console.log(slotKey, result, result === slotKey);
    return result === slotKey;
  }

  describe("Change X", function () {

    it("Should work with Logic1", async function () {
      const { proxy, proxyAsLogic1, logic1 } = await loadFixture(deployProxyFixture);

      await proxy.changeImplementation(logic1.target);

      assert.equal(await logic1.x(), 0);

      await proxyAsLogic1.changeX(48);

      // assert.equal(await logic1.x(), 48); // call
      assert.equal(await logic1.x(), 0); // delegatecall
    });

    it("Should work with Logic2", async function () {
      const { proxy, proxyAsLogic2, logic2 } = await loadFixture(deployProxyFixture);

      await proxy.changeImplementation(logic2.target);

      assert.equal(await logic2.x(), 0);

      await proxyAsLogic2.changeX(73);

      // assert.equal(await logic2.x(), 73); // call
      assert.equal(await logic2.x(), 0); // delegatecall
    });
  });

  describe("Change X Multiple", function () {

    it("Should work with Logic1 and Logic2", async function () {
      const { proxy, proxyAsLogic1, proxyAsLogic2, logic1, logic2 } = await loadFixture(deployProxyFixture);

      await proxy.changeImplementation(logic1.target);

      assert.equal(await logic1.x(), 0);
      await proxyAsLogic1.changeX(48);

      // assert.equal(await logic1.x(), 48); // call
      assert.equal(await logic1.x(), 0); // delegatecall

      await proxy.changeImplementation(logic2.target);
      assert.equal(await logic2.x(), 0);

      await proxyAsLogic2.changeX(73);
      await proxyAsLogic2.tripleX();

      // assert.equal(await logic2.x(), 73 * 3); // call
      assert.equal(await logic2.x(), 0); // delegatecall
    });
  });


  describe("Change X Lookup", function () {

    it("Should look at Logic1 and Logic2", async function () {
      const { proxy, proxyAsLogic1, proxyAsLogic2, logic1, logic2 } = await loadFixture(deployProxyFixture);

      // Start with Logic1
      await proxy.changeImplementation(logic1.target);

      assert.equal(await lookupAt(proxy.target, "0x0", 0), true); // first slot: Proxy.sol > address implementation;
      await proxyAsLogic1.changeX(48);
      assert.equal(await lookupAt(proxy.target, "0x0", 48), true);

      // Upgrade with Logic2
      await proxy.changeImplementation(logic2.target);

      assert.equal(await lookupAt(proxy.target, "0x0", 48), true); // first slot: Proxy.sol > address implementation;
      await proxyAsLogic2.changeX(73);
      assert.equal(await lookupAt(proxy.target, "0x0", 73), true);
      await proxyAsLogic2.tripleX();
      assert.equal(await lookupAt(proxy.target, "0x0", 73 * 3), true);
    });
  });
});
