export interface ResponseFundingBinance {
  symbol: string;
  markPrice: string;
  indexPrice: string;
  estimatedSettlePrice: string;
  lastFundingRate: string;
  interestRate: string;
  nextFundingTime: string;
  time: number;
}
export interface ResponseDataFunding {
  symbol: string;
  fundingRateLast: string;
  fundingRateEst: string;
  nextFundingTime: string;
}

export interface ResponseDataBybit {
  symbol: string;
  fundingRate: string;
  nextFundingTime: string;
}
