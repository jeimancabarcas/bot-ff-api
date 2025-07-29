export enum Side {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum positionSide {
  LONG = 'LONG',
  SHORT = 'SHORT',
}

export interface ResponseDataWebsocket {
  E: number;
  s: string;
  P: string;
  i: string;
  r: string;
  T: number;
}
