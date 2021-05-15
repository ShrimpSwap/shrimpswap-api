import { NowRequest, NowResponse } from "@vercel/node";
import BigNumber from "bignumber.js";
import { getContract } from "../lib/web3";

const chefABI = require("../contracts/chef");

const getBalanceNumber = (balance: any, decimals = 18) => {
  const displayBalance = balance.dividedBy(new BigNumber(10).pow(decimals));
  return displayBalance.toNumber();
};

const pending = async (pid: number, address: string) => {
  const chef = getContract(chefABI, "0xB4405445fFAcF2B86BC2bD7D1C874AC739265658");
  const pending = await chef.methods.pendingCake(pid, address).call();
  const poolInfo = await chef.methods.poolInfo(pid).call();
  return {
    pending: getBalanceNumber(new BigNumber(pending)),
    poolInfo,
  };
};

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  const { address = "0x023080cdd8485ba54161117689d9bEe0228569dc", pid = "1" } = req.query;
  if (Array.isArray(pid)) {
    res.status(400).send({ error: "Parameter Incorrect" });
  } else {
    const data = await pending(Number(pid), address as string);
    res.status(200).send(data);
  }
};
