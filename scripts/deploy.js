const hre = require("hardhat");

async function main() {
    console.log("Starting deployment...");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy Token
    const MAX_SUPPLY = hre.ethers.parseEther("1000000"); // 1M tokens
    const Token = await hre.ethers.getContractFactory("YourToken");
    const token = await Token.deploy("My Awesome Token", "MAT", MAX_SUPPLY);
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log("Token deployed to:", tokenAddress);

    // Deploy Faucet
    const Faucet = await hre.ethers.getContractFactory("TokenFaucet");
    const faucet = await Faucet.deploy(tokenAddress);
    await faucet.waitForDeployment();
    const faucetAddress = await faucet.getAddress();
    console.log("Faucet deployed to:", faucetAddress);

    // Set Minter
    console.log("Setting minter role...");
    const tx = await token.setMinter(faucetAddress);
    await tx.wait();
    console.log("Minter role set!");

    console.log("Deployment complete!");

    // Wait for a few block confirmations before verification
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("Waiting for block confirmations for verification...");
        await token.deploymentTransaction().wait(5);
        await faucet.deploymentTransaction().wait(5);

        try {
            console.log("Verifying Token...");
            await hre.run("verify:verify", {
                address: tokenAddress,
                constructorArguments: ["My Awesome Token", "MAT", MAX_SUPPLY],
            });
        } catch (e) {
            console.log("Token verification failed:", e.message);
        }

        try {
            console.log("Verifying Faucet...");
            await hre.run("verify:verify", {
                address: faucetAddress,
                constructorArguments: [tokenAddress],
            });
        } catch (e) {
            console.log("Faucet verification failed:", e.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
