export type Transaction = {
  // a UUID of transaction
  ID: string;
  // in USD, typically a value betwen 0.01 and 1000 USD.
  Amount: number;
  // a 2-letter country code of where the bank is located
  BankCountryCode: string;
};

export type ProcessedTransactionResult = {
  id: string;
  fraudulent: boolean;
};
