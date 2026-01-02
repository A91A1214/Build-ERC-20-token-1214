const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("TokenFaucet", function () {
    let token;
    let faucet;
    let owner;
    let addr1;
    let addr2;

    const MAX_SUPPLY = ethers.parseEther("1000000");
    const FAUCET_AMOUNT = ethers.parseEther("100");
    const COOLDOWN_TIME = 24 * 60 * 60;
    const MAX_CLAIM_AMOUNT = ethers.parseEther("1000");

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("YourToken");
        token = await Token.deploy("Test Token", "TEST", MAX_SUPPLY);

        const Faucet = await ethers.getContractFactory("TokenFaucet");
        faucet = await Faucet.deploy(await token.getAddress());

        await token.setMinter(await faucet.getAddress());
    });

    describe("Deployment", function () {
        it("Should set the correct token address", async function () {
            expect(await faucet.token()).to.equal(await token.getAddress());
        });

        it("Should set the correct admin", async function () {
            expect(await faucet.owner()).to.equal(owner.address);
        });
    });

    describe("Requesting Tokens", function () {
        it("Should allow a user to claim tokens", async function () {
            await faucet.connect(addr1).requestTokens();
            expect(await token.balanceOf(addr1.address)).to.equal(FAUCET_AMOUNT);

            const lastClaim = await faucet.lastClaimAt(addr1.address);
            expect(lastClaim).to.be.gt(0n);
        });

        it("Should revert if claiming during cooldown", async function () {
            await faucet.connect(addr1).requestTokens();
            await expect(faucet.connect(addr1).requestTokens()).to.be.revertedWith(
                "Cooldown period not elapsed or limit reached"
            );
        });

        it("Should allow claiming after cooldown", async function () {
            await faucet.connect(addr1).requestTokens();
            await time.increase(COOLDOWN_TIME + 1);
            await faucet.connect(addr1).requestTokens();
            expect(await token.balanceOf(addr1.address)).to.equal(FAUCET_AMOUNT * 2n);
        });

        it("Should revert if lifetime limit reached", async function () {
            // Claim 10 times (10 * 100 = 1000 = MAX_CLAIM_AMOUNT)
            for (let i = 0; i < 10; i++) {
                await faucet.connect(addr1).requestTokens();
                if (i < 9) await time.increase(COOLDOWN_TIME + 1);
            }

            await expect(faucet.connect(addr1).requestTokens()).to.be.revertedWith(
                "Cooldown period not elapsed or limit reached"
            );
        });

        it("Should revert if faucet is paused", async function () {
            await faucet.setPaused(true);
            await expect(faucet.connect(addr1).requestTokens()).to.be.revertedWith("Faucet is paused");
        });
    });

    describe("Admin Functions", function () {
        it("Should allow owner to pause and unpause", async function () {
            await faucet.setPaused(true);
            expect(await faucet.paused()).to.be.true;
            await faucet.setPaused(false);
            expect(await faucet.paused()).to.be.false;
        });

        it("Should revert if non-owner tries to pause", async function () {
            await expect(faucet.connect(addr1).setPaused(true)).to.be.revertedWithCustomError(
                faucet,
                "OwnableUnauthorizedAccount"
            );
        });
    });

    describe("Utility Functions", function () {
        it("canClaim should return correct status", async function () {
            expect(await faucet.canClaim(addr1.address)).to.be.true;
            await faucet.connect(addr1).requestTokens();
            expect(await faucet.canClaim(addr1.address)).to.be.false;
            await time.increase(COOLDOWN_TIME + 1);
            expect(await faucet.canClaim(addr1.address)).to.be.true;
        });

        it("remainingAllowance should return correct amount", async function () {
            expect(await faucet.remainingAllowance(addr1.address)).to.equal(MAX_CLAIM_AMOUNT);
            await faucet.connect(addr1).requestTokens();
            expect(await faucet.remainingAllowance(addr1.address)).to.equal(MAX_CLAIM_AMOUNT - FAUCET_AMOUNT);
        });
    });
});
