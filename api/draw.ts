import { NowRequest, NowResponse } from "@vercel/node";
import moment from "moment";
import Web3 from "web3";
import { getContract, getWeb3 } from "../lib/web3";
import { LOTTERY_CONTRACT } from "../utils/constants";

const lotteryABI = require("../contracts/lottery");

const web3 = getWeb3();

const getRandomNumber = () => {
  return Math.floor(Math.random() * 899999 + 100000);
};

const drawAndReset = async () => {
  if (!process.env.ADDRESS || !process.env.PRIVATE_KEY) {
    throw new Error("Missing ADDRESS or PRIVATE_KEY");
  }

  const account = {
    address: process.env.ADDRESS,
    privateKey: process.env.PRIVATE_KEY,
    web3: new Web3(new Web3.providers.HttpProvider(`https://bsc-dataseed.binance.org/`, { timeout: 30000 })),
  };

  const accountWithPrivateKey = web3.eth.accounts.privateKeyToAccount("0x" + account.privateKey);
  web3.eth.accounts.wallet.add(accountWithPrivateKey);
  web3.eth.defaultAccount = accountWithPrivateKey.address;

  const lottery = getContract(lotteryABI, LOTTERY_CONTRACT);

  let nonce = await web3.eth.getTransactionCount(accountWithPrivateKey.address);

  const txOptions = {
    nonce: Number(web3.utils.toHex(nonce)),
    from: accountWithPrivateKey.address,
    to: LOTTERY_CONTRACT,
    gas: web3.utils.toHex(750000),
    gasPrice: web3.utils.toHex(10e9),
    data: lottery.methods.drawAndReset(getRandomNumber()).encodeABI(),
  };

  const signed2 = await web3.eth.accounts.signTransaction(txOptions, account.privateKey);

  if (!signed2.rawTransaction) {
    throw new Error("No rawTransaction");
  }

  await web3.eth
    .sendSignedTransaction(signed2.rawTransaction)
    .on("error", function (err) {
      console.log("error", err);
    })
    .on("transactionHash", function (transactionHash) {
      console.log("transactionHash", transactionHash);
    })
    .on("receipt", function (receipt) {
      console.log("receipt", receipt);
    });
};

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  const { token } = req.query;

  const timeFirstReset = moment.utc("19/03/2021T09:00", "DD/MM/YYYYTHH:mm");

  let nextLotteryDraw = timeFirstReset.clone();
  while (nextLotteryDraw.isBefore(moment.utc())) {
    nextLotteryDraw = nextLotteryDraw.add(2, "days");
  }

  const isLotteryDay =
    nextLotteryDraw.date() === moment.utc().date() || nextLotteryDraw.date() === moment.utc().add(2, "days").date();

  if (!isLotteryDay) {
    res.status(418).send({ error: "Today is not a lottery day" });
    return;
  }

  if (typeof token !== "undefined" && token === "42") {
    const data = await drawAndReset();
    res.status(200).send(data);
  } else {
    res.status(400).send({ error: "Invalid Query param" });
  }
};
