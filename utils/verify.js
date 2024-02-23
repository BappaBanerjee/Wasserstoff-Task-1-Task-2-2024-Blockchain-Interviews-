const { run } = require("hardhat");

const verify = async (contractAddress, args) => {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.log(e);
    }
  }
};

module.exports = { verify };

//proxy contract -> 0x25a913afafF2BE67258e19c27030D030EFCa0B1d

//proxy admin -> 0x4C37157Dc252dAcF1c88941138362F573E338F87

//token 1 -> 0xEFbA3E015EaBF6BE7C095B3d0d61beF6256485e0

//token 2 -> 0x651eA9d9F5343F5a8Eab74968e933a910B479509
