const productData = [
  {
    sku: 'JEW0001',
    name: '复古耳环',
    stock: 120,
    cost: 5.2,
    unit: 'Pc',
    supplier: '供应商A',
    supplierUrl: 'https://example.com/item1',
    transactions: [
      { date: '7 Aug 2025', change: -1, type: 'sale', details: 'Order #123' },
      { date: '8 Sept 2025', change: +20, type: 'restock', details: 'PO #567' },
    ],
  },
  {
    sku: 'JEW0002',
    name: '珍珠项链',
    stock: 60,
    cost: 8.75,
    unit: 'Pack',
    supplier: '供应商B',
    supplierUrl: 'https://example.com/item2',
    transactions: [],
  },
  {
    sku: 'JEW0003',
    name: '水晶手链',
    stock: 40,
    cost: 3.95,
    unit: 'Pc',
    supplier: '供应商C',
    supplierUrl: 'https://example.com/item3',
    transactions: [],
  },
];

export default productData;
