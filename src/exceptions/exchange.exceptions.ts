import { AxiosError } from 'axios';

export class ExchangeException extends Error {
  constructor(
    public readonly exchange: string,
    message: string,
    public readonly code: string,
    public readonly httpStatus: number,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ExchangeConnectionException extends ExchangeException {
  isTimeout: any;
  constructor(exchange: string, error: Error | AxiosError) {
    let message = 'Connection error';
    let code = 'CONNECTION_ERROR';
    let httpStatus = 502; // Bad Gateway

    if (error instanceof AxiosError) {
      if (error.code === 'ECONNABORTED') {
        message = 'Request timeout';
        code = 'TIMEOUT';
        httpStatus = 408;
      } else if (error.code === 'ENOTFOUND') {
        message = 'Service unavailable';
        code = 'SERVICE_UNAVAILABLE';
        httpStatus = 503;
      }
    }

    super(exchange, message, code, httpStatus);
  }
}

export class ExchangeApiException extends ExchangeException {
  constructor(
    exchange: string,
    public readonly apiCode: string,
    public readonly apiMessage: string,
    public readonly responseData?: any,
  ) {
    super(exchange, `API Error: ${apiMessage}`, apiCode, 502);
  }
}

export class InvalidOrderDataException extends ExchangeException {
  constructor(exchange: string, reason: string) {
    super(exchange, `Invalid order data: ${reason}`, 'INVALID_DATA', 400);
  }
}

export class RateLimitException extends ExchangeException {
  constructor(
    exchange: string,
    public readonly retryAfter?: number,
  ) {
    super(
      exchange,
      retryAfter ? `Rate limited. Try after ${retryAfter}ms` : 'Rate limited',
      'RATE_LIMITED',
      429,
    );
  }
}
