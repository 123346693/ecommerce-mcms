const productData = [
  {
    sku: 'JEW9999',
    name: '多位置多交易产品',
    stock: 999,
    cost: 15.9,
    unit: 'Pack',
    height: 12,
    width: 8,
    depth: 6,
    weight: 0.3,
    stockLocations: [
      { location: 'EB-001-A', quantity: 15 },
      { location: 'EB-001-B', quantity: 20 },
      { location: 'BNP07B', quantity: 200 },
      { location: 'BNP07C', quantity: 100 },
      { location: 'BNP07D', quantity: 150 },
      { location: 'OVERFLOW01', quantity: 300 },
      { location: 'EMERGENCY01', quantity: 100 },
    ],
    transactions: [
      { date: '1 Sept 2025', quantity: -1 },
      { date: '2 Sept 2025', quantity: +20 },
      { date: '3 Sept 2025', quantity: -10 },
      { date: '4 Sept 2025', quantity: -5 },
      { date: '5 Sept 2025', quantity: +30 },
      { date: '6 Sept 2025', quantity: -2 },
      { date: '7 Sept 2025', quantity: +15 },
      { date: '8 Sept 2025', quantity: -6 },
      { date: '9 Sept 2025', quantity: +25 },
      { date: '10 Sept 2025', quantity: -3 },
      { date: '11 Sept 2025', quantity: +40 },
    ],
  },
];

export default productData;
