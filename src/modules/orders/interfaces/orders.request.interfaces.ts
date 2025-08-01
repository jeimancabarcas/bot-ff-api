export enum Side {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum positionSide {
  LONG = 'LONG',
  SHORT = 'SHORT',
}

export interface ResponseDataWebsocket {
  stream: string;
  data: {
    e: string;
    E: number;
    s: string;
    p: string;
    P: string;
    i: string;
    r: string;
    T: number;
  };
}
