export const stripeProducts = {
  grantMatching: {
    name: 'Grant-Matching-Service',
    description: "Access The World's Largest Directory of Grants and Residencies for Art and Design",
    priceId: 'price_1PY648A519HeiA5gsQJiTwdmdcAA',
    mode: 'subscription' as const,
  },
};

export const stripePrices = {
  grantMatching: {
    id: 'price_1PY648A519HeiA5gsQJiTwdmdcAA',
    amount: 990, // $9.90 in cents
    currency: 'usd',
    interval: 'month',
  },
};