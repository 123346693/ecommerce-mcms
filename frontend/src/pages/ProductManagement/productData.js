const productsData = [
  {
    sku: "JEW9999",
    name: "多位置多交易产品",
    cost: 15.9,
    unit: "Pack",
    height: 12,
    width: 8,
    depth: 6,
    weight: 0.3,
    stockLocations: [
      { location: "EB-001-A", quantity: 500 },
      { location: "BNP-07", quantity: 200 },
      { location: "RACK-12", quantity: 185 }
    ],
    transactions: [
      { date: "2025-08-10", quantity: -10 },
      { date: "2025-08-08", quantity: +50 },
      { date: "2025-08-05", quantity: -15 },
      { date: "2025-08-03", quantity: +100 },
      { date: "2025-08-01", quantity: -20 },
      { date: "2025-07-29", quantity: +60 },
      { date: "2025-07-25", quantity: -5 }
    ]
  },
  {
    sku: "ELEC2025",
    name: "高性能电源适配器",
    cost: 29.9,
    unit: "Piece",
    height: 5,
    width: 10,
    depth: 3,
    weight: 0.5,
    stockLocations: [
      { location: "STOR-01", quantity: 120 },
      { location: "STOR-02", quantity: 50 }
    ],
    transactions: [
      { date: "2025-08-11", quantity: -5 },
      { date: "2025-08-09", quantity: +20 },
      { date: "2025-08-07", quantity: -2 },
      { date: "2025-08-05", quantity: +15 }
    ]
  },
  {
    sku: "TOY8888",
    name: "儿童积木套装",
    cost: 49.0,
    unit: "Box",
    height: 25,
    width: 20,
    depth: 10,
    weight: 1.5,
    stockLocations: [
      { location: "TOY-01", quantity: 300 },
      { location: "TOY-02", quantity: 150 },
      { location: "TOY-03", quantity: 100 }
    ],
    transactions: [
      { date: "2025-08-10", quantity: -30 },
      { date: "2025-08-08", quantity: +100 },
      { date: "2025-08-06", quantity: -20 },
      { date: "2025-08-04", quantity: +50 }
    ]
  },
  {
    sku: "CLOTH555",
    name: "夏季短袖T恤",
    cost: 19.5,
    unit: "Piece",
    height: 2,
    width: 30,
    depth: 25,
    weight: 0.2,
    stockLocations: [
      { location: "CLOT-01", quantity: 400 },
      { location: "CLOT-02", quantity: 180 }
    ],
    transactions: [
      { date: "2025-08-09", quantity: -15 },
      { date: "2025-08-07", quantity: +60 },
      { date: "2025-08-05", quantity: -20 }
    ]
  },
  {
    sku: "FOOD777",
    name: "进口咖啡豆 1kg",
    cost: 35.0,
    unit: "Bag",
    height: 15,
    width: 10,
    depth: 10,
    weight: 1,
    stockLocations: [
      { location: "FOOD-01", quantity: 80 },
      { location: "FOOD-02", quantity: 60 }
    ],
    transactions: [
      { date: "2025-08-10", quantity: -5 },
      { date: "2025-08-08", quantity: +30 },
      { date: "2025-08-06", quantity: -10 }
    ]
  },
  {
    sku: "ACC4567",
    name: "蓝牙无线耳机",
    cost: 59.9,
    unit: "Set",
    height: 8,
    width: 8,
    depth: 4,
    weight: 0.15,
    stockLocations: [
      { location: "ELEC-03", quantity: 200 },
      { location: "ELEC-04", quantity: 150 }
    ],
    transactions: [
      { date: "2025-08-11", quantity: -8 },
      { date: "2025-08-09", quantity: +40 },
      { date: "2025-08-07", quantity: -12 }
    ]
  },
  {
    sku: "BOOK2025",
    name: "畅销小说合集",
    cost: 89.0,
    unit: "Set",
    height: 25,
    width: 18,
    depth: 8,
    weight: 2,
    stockLocations: [
      { location: "BOOK-01", quantity: 100 },
      { location: "BOOK-02", quantity: 50 }
    ],
    transactions: [
      { date: "2025-08-10", quantity: -3 },
      { date: "2025-08-08", quantity: +20 },
      { date: "2025-08-06", quantity: -5 }
    ]
  }
];

export default productsData;
