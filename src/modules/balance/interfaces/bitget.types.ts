export type PromiseBitget = {
  accountType: string;
  usdtBalance: string;
};
export interface ApiresponseBitget {
  balance: PromiseBitget[];
}
