import { NowRequest, NowResponse } from "@vercel/node";

import { getContract } from "../lib/web3";
import { SHRIMP, BUSD, SHRIMP_BUSD } from "../utils/constants";
import bep20 from "../contracts/bep20.json";
import BigNumber from "bignumber.js";

const getPrice = async (): Promise<BigNumber> => {
  const tokenBalanceLP = await getContract(bep20, SHRIMP).methods.balanceOf(SHRIMP_BUSD).call();
  const quoteTokenBalanceLP = await getContract(bep20, BUSD).methods.balanceOf(SHRIMP_BUSD).call();
  return new BigNumber(quoteTokenBalanceLP).div(new BigNumber(tokenBalanceLP));
};

const getTotalSupply = async (): Promise<BigNumber> => {
  const totalSupply = await getContract(bep20, SHRIMP).methods.totalSupply().call();
  return new BigNumber(totalSupply);
};

export default async (_: NowRequest, res: NowResponse): Promise<void> => {
  const price = await getPrice();
  const totalSupply = await getTotalSupply();

  res.json({
    address: "0x62ee12e4fe74a815302750913c3c796bca23e40e",
    price: price.toNumber(),
    totalSupply: totalSupply.toNumber(),
    owner: "0xABEE2aaF12E92384274D61d0dbd31bD7Fc35f38c",
    name: "Shrimp Token",
    symbol: "SHRIMP",
    decimals: 18,
    site: "https://www.shrimpswap.finance",
    github: "https://github.com/shrimpswap",
    documentation: "https://shrimpswap.gitbook.io",
    telegram: "https://t.me/shrimpswapchat",
    twitter: "https://twitter.com/shrimpswap",
  });
};
