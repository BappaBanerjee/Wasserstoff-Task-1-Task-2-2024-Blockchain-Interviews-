const { expect } = require("chai");
const { assertArgument } = require("ethers");
const { ethers, deployments } = require("hardhat");

describe("Proxy contract unit testing", () => {
  let deployer;
  let anotherAccount;
  let Proxy;
  let proxyAddr;
  let ProxyAdmin;
  let proxyAdminAddr;
  let Token1;
  let Token2;
  let token1Addr;
  let token2Addr;

  let DECIMAL = 10 ** 18;
  let INITIAL_BAL = BigInt(2000 * DECIMAL);

  let address0 = "0x0000000000000000000000000000000000000000";

  const functionId = {
    stake: "0x3a4b66f1",
    withdraw: "0x3ccfd60b",
    balanceOf: "0x70a08231",
    transfer: "0xa9059cbb",
    mint: "0x40c10f19",
    owner: "0x8da5cb5b",
    initialize: "0x8129fc1c",
  };

  beforeEach(async function () {
    [deployer, anotherAccount] = await ethers.getSigners();
    await deployments.fixture("all");

    Proxy = await ethers.getContract("Proxy", deployer);
    proxyAddr = await Proxy.getAddress();

    ProxyAdmin = await ethers.getContract("ProxyAdmin", deployer);
    proxyAdminAddr = await ProxyAdmin.getAddress();
    //token contract required for testing....
    Token1 = await ethers.getContract("Token1", deployer);
    Token2 = await ethers.getContract("Token2", deployer);

    Token1.initialize();

    token1Addr = await Token1.getAddress();
    token2Addr = await Token2.getAddress();
  });

  describe("setting admin of the proxy contract to ProxyAdmin contract and calling functions", async function () {
    beforeEach(async function () {
      //change admin of the proxy contract to proxy admin
      await Proxy.changeAdmin(proxyAdminAddr);
    });

    it("should set the admin of the proxy contract to the deployer", async function () {
      expect(await ProxyAdmin.owner()).to.be.equal(deployer.address);
    });

    describe("calling set and get admin function of proxy contract", async function () {
      it("should update the admin of the proxy contract to the proxyAdmin contract address", async function () {
        expect(await ProxyAdmin.getProxyAdmin(proxyAddr)).to.be.equal(
          proxyAdminAddr
        );
      });

      it("should throw an error with custom msg Implementation_NotFound when called from non-admin account", async function () {
        await expect(Proxy.admin()).to.be.revertedWithCustomError(
          Proxy,
          "Implementation_NotFound"
        );
      });

      it("should change the admin of the proxy contract", async function () {
        await ProxyAdmin.changeProxyAdmin(proxyAddr, anotherAccount);
        //Not the owner any more
        await expect(ProxyAdmin.getProxyAdmin(proxyAddr)).to.be.revertedWith(
          "call failed"
        );
      });
    });

    describe("calling set and get of proxy implemetation functions", async function () {
      it("should throw an errror  with msg call failed because there is no implementation", async function () {
        expect(
          await ProxyAdmin.getProxyImplementation(proxyAddr, functionId.stake)
        ).to.be.equal(address0);
      });

      it("should set the implementation for the functionId", async function () {
        await ProxyAdmin.upgradeImplementation(
          proxyAddr,
          token1Addr,
          functionId.stake
        );

        expect(
          await ProxyAdmin.getProxyImplementation(proxyAddr, functionId.stake)
        ).to.be.equal(token1Addr);
      });

      it("should throw an error when calling upgrade from differnt account", async function () {
        await expect(
          ProxyAdmin.connect(anotherAccount).upgradeImplementation(
            proxyAddr,
            token1Addr,
            functionId.stake
          )
        ).to.be.revertedWithCustomError(ProxyAdmin, "NOT_AUTHORIZED");
      });
    });

    describe("delete implementation function", function () {
      beforeEach(async function () {
        await ProxyAdmin.upgradeImplementation(
          proxyAddr,
          token1Addr,
          functionId.stake
        );
      });

      it("should delete the implemetation for the functionId", async function () {
        expect(
          await ProxyAdmin.getProxyImplementation(proxyAddr, functionId.stake)
        ).to.be.equal(token1Addr);

        await ProxyAdmin.deleteImplementation(proxyAddr, functionId.stake);

        expect(
          await ProxyAdmin.getProxyImplementation(proxyAddr, functionId.stake)
        ).to.be.revertedWith("call failed");
      });

      it("should throw a custom error when called from another account", async function () {
        await expect(
          ProxyAdmin.connect(anotherAccount).deleteImplementation(
            proxyAddr,
            functionId.stake
          )
        ).to.be.revertedWithCustomError(ProxyAdmin, "NOT_AUTHORIZED");
      });
    });
  });

  describe("test cases for Proxy user Interface", async function () {
    let proxyInterface;
    beforeEach(async function () {
      proxyInterface = await ethers.getContractAt("Token1", proxyAddr);
      await Proxy.changeAdmin(proxyAdminAddr);
      await ProxyAdmin.upgradeImplementation(
        proxyAddr,
        token1Addr,
        functionId.mint
      );
      await ProxyAdmin.upgradeImplementation(
        proxyAddr,
        token1Addr,
        functionId.balanceOf
      );
      await ProxyAdmin.upgradeImplementation(
        proxyAddr,
        token1Addr,
        functionId.owner
      );
      await ProxyAdmin.upgradeImplementation(
        proxyAddr,
        token1Addr,
        functionId.initialize
      );
      await ProxyAdmin.upgradeImplementation(
        proxyAddr,
        token1Addr,
        functionId.transfer
      );
    });

    describe.only("initializing the owner of the token", async function () {
      it.only("should initialize the owner of the token contract", async function () {
        console.log(await Token1.owner());

        await proxyInterface.initialize();
        console.log(await Token1.initialize());
        expect(await proxyInterface.owner()).to.equal(deployer.address);
      });

      it("should revert if initialized call more than once", async function () {
        await proxyInterface.initialize();

        await expect(proxyInterface.initialize()).to.be.revertedWithCustomError(
          Token1,
          "InvalidInitialization"
        );
      });
    });
    describe("testing for token1 smart contract", async function () {
      beforeEach(async function () {
        //initialize the proxy contrat
        await proxyInterface.initialize();
      });

      it("should mint the token", async function () {
        await proxyInterface.mint(deployer.address, INITIAL_BAL);

        expect(await proxyInterface.balanceOf(deployer.address)).to.equal(
          INITIAL_BAL
        );
      });

      it("should transfer funds from one address to another", async function () {
        await proxyInterface.mint(deployer.address, INITIAL_BAL);

        await proxyInterface.transfer(anotherAccount, 200);

        expect(await proxyInterface.balanceOf(deployer.address)).to.be.equal(
          INITIAL_BAL - BigInt(200)
        );

        expect(await proxyInterface.balanceOf(anotherAccount)).to.be.equal(
          BigInt(200)
        );
      });

      it("should revert with custom message", async function () {
        await expect(proxyInterface.transfer(anotherAccount, 200)).to.be
          .reverted;
      });

      it("should update the implementation address of the function to new contract address", async function () {
        await proxyInterface.mint(deployer.address, INITIAL_BAL);

        await ProxyAdmin.upgradeImplementation(
          proxyAddr,
          token2Addr,
          functionId.balanceOf
        );

        expect(
          await ProxyAdmin.getProxyImplementation(
            proxyAddr,
            functionId.balanceOf
          )
        ).to.be.equal(token2Addr);

        let proxy2Interface = await ethers.getContractAt("Token1", proxyAddr);

        expect(await proxy2Interface.balanceOf(deployer.address)).to.be.equal(
          INITIAL_BAL
        );
      });
    });
  });
});
