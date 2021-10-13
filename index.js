const axios = require("axios");
const { abi } = require("./abi");
const abiDecoder = require("abi-decoder");
const address = "0x7d9d3659dcfbea08a87777c52020BC672deece13";

const Web3 = require("web3");
const web3 = new Web3(
  "https://mainnet.infura.io/v3/1d62c2d15fee4c2e93097c1c4a09b25c"
);
const contract = new web3.eth.Contract(abi, address);

const getStakeType = async () => {
  const blockHeight = web3.eth.getBlockNumber();
  const apiKey = "1I7CQYN5BDM81B3FVBQQCCIZXC14XITVC5";
  axios
    .get(
      `http://api.etherscan.io/api?module=account&action=txlist&address=0x7d9d3659dcfbea08a87777c52020BC672deece13&startblock=${blockHeight}&endblock=${blockHeight}&sort=asc&apikey=${apiKey}`
    )
    .then((res) => {
      let farming = 0;
      let training = 0;
      let unknown = 0;
      res.data.result.map((input) => {
        abiDecoder.addABI(abi);
        const decoded = abiDecoder.decodeMethod(input.input);

        const getType = decoded;

        if (decoded) {
          if (
            getType.name === "doAction" ||
            getType.name === "doActionWithManyOrcs"
          ) {
            switch (true) {
              case getType.params[1].value === "1":
                return farming++;

              case getType.params[1].value === "2":
                return training++;

              default:
                return unknown++;
            }
          }
        }
      });

      console.log(
        "Farming:",
        farming,
        "Training:",
        training,
        "Unknown:",
        unknown
      );
    });
};

const main = async () => {
  const minted = await contract.methods
    .totalSupply()
    .call()
    .then((res) => {
      return res;
    });

  const staked = await contract.methods
    .balanceOf("0x7d9d3659dcfbea08a87777c52020BC672deece13")
    .call()
    .then((res) => {
      return res;
    });

  console.log(
    `Minted: ${minted}`,
    `Staked: ${staked}`,
    `- - - ${Math.floor((staked / minted) * 100)}% Staked`
  );
  getStakeType();
};

setInterval(() => {
  main();
}, 20000);

console.log("Initializing...");
