export interface OrderBooksResponse {
  exchange: string;
  bids: bids[];
  asks: asks[];
}

type bids = {
  price: number;
  qyt: number;
};

type asks = {
  price: number;
  qyt: number;
};
