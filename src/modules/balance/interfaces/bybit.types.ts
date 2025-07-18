export type coin = {
  availableToBorro: string;
  bonus: string;
  accruedInterest: string;
  availableToWithdra: string;
  totalOrderIM: string;
  equity: string;
  totalPositionMM: string;
  usdValue: string;
  unrealisedPnl: string;
  collateralSwitch: boolean;
  spotHedgingQty: string;
  borrowAmount: string;
  totalPositionIM: string;
  walletBalance: string;
  cumRealisedPnl: string;
  locked: string;
  marginCollateral: boolean;
  coin: string;
};
export interface walletResponseBybit {
  accountIMRate: string;
  totalMaintenanceMarginByMp: string;
  totalInitialMargin: string;
  accountType: string;
  accountMMRate: string;
  accountMMRateByMp: string;
  accountIMRateByMp: string;
  totalInitialMarginByMp: string;
  totalMaintenanceMargin: string;
  totalEquity: string;
  totalMarginBalance: string;
  totalAvailableBalance: string;
  totalPerpUPL: string;
  totalWalletBalance: string;
  accountLTV: string;
  coin: coin[];
}
