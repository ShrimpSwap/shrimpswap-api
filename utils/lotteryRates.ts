export interface Rates {
  burn: number;
  jackpot: number;
  match3: number;
  match2: number;
  match1?: number;
}

export const rates: Rates = {
  burn: 20,
  jackpot: 50,
  match3: 20,
  match2: 10,
};
