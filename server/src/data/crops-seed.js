const crops = [
  {
    name: 'Rice',
    name_hi: 'धान',
    category: 'cereal',
    avg_duration_days: 120,
    stages: JSON.stringify([
      { name: 'Nursery/Germination', start_day: 0, end_day: 20 },
      { name: 'Transplanting', start_day: 21, end_day: 30 },
      { name: 'Tillering', start_day: 31, end_day: 55 },
      { name: 'Panicle Initiation', start_day: 56, end_day: 70 },
      { name: 'Flowering', start_day: 71, end_day: 85 },
      { name: 'Grain Filling', start_day: 86, end_day: 105 },
      { name: 'Maturity', start_day: 106, end_day: 120 }
    ])
  },
  {
    name: 'Wheat',
    name_hi: 'गेहूं',
    category: 'cereal',
    avg_duration_days: 140,
    stages: JSON.stringify([
      { name: 'Germination', start_day: 0, end_day: 14 },
      { name: 'Seedling/Tillering', start_day: 15, end_day: 45 },
      { name: 'Stem Elongation', start_day: 46, end_day: 65 },
      { name: 'Booting', start_day: 66, end_day: 80 },
      { name: 'Heading/Flowering', start_day: 81, end_day: 95 },
      { name: 'Grain Filling', start_day: 96, end_day: 120 },
      { name: 'Maturity', start_day: 121, end_day: 140 }
    ])
  },
  {
    name: 'Maize',
    name_hi: 'मक्का',
    category: 'cereal',
    avg_duration_days: 110,
    stages: JSON.stringify([
      { name: 'Germination', start_day: 0, end_day: 10 },
      { name: 'Seedling', start_day: 11, end_day: 25 },
      { name: 'Vegetative Growth', start_day: 26, end_day: 50 },
      { name: 'Tasseling/Silking', start_day: 51, end_day: 65 },
      { name: 'Grain Filling', start_day: 66, end_day: 90 },
      { name: 'Maturity', start_day: 91, end_day: 110 }
    ])
  },
  {
    name: 'Tomato',
    name_hi: 'टमाटर',
    category: 'vegetable',
    avg_duration_days: 100,
    stages: JSON.stringify([
      { name: 'Nursery', start_day: 0, end_day: 25 },
      { name: 'Transplanting/Establishment', start_day: 26, end_day: 35 },
      { name: 'Vegetative Growth', start_day: 36, end_day: 50 },
      { name: 'Flowering', start_day: 51, end_day: 65 },
      { name: 'Fruit Setting', start_day: 66, end_day: 80 },
      { name: 'Harvesting', start_day: 81, end_day: 100 }
    ])
  },
  {
    name: 'Potato',
    name_hi: 'आलू',
    category: 'vegetable',
    avg_duration_days: 100,
    stages: JSON.stringify([
      { name: 'Sprouting', start_day: 0, end_day: 15 },
      { name: 'Vegetative Growth', start_day: 16, end_day: 35 },
      { name: 'Tuber Initiation', start_day: 36, end_day: 50 },
      { name: 'Tuber Bulking', start_day: 51, end_day: 75 },
      { name: 'Maturity', start_day: 76, end_day: 100 }
    ])
  },
  {
    name: 'Onion',
    name_hi: 'प्याज',
    category: 'vegetable',
    avg_duration_days: 130,
    stages: JSON.stringify([
      { name: 'Nursery', start_day: 0, end_day: 40 },
      { name: 'Transplanting', start_day: 41, end_day: 50 },
      { name: 'Vegetative Growth', start_day: 51, end_day: 75 },
      { name: 'Bulb Formation', start_day: 76, end_day: 105 },
      { name: 'Maturity', start_day: 106, end_day: 130 }
    ])
  },
  {
    name: 'Cotton',
    name_hi: 'कपास',
    category: 'fiber',
    avg_duration_days: 180,
    stages: JSON.stringify([
      { name: 'Germination', start_day: 0, end_day: 12 },
      { name: 'Seedling', start_day: 13, end_day: 30 },
      { name: 'Vegetative Growth', start_day: 31, end_day: 60 },
      { name: 'Square Formation', start_day: 61, end_day: 80 },
      { name: 'Flowering', start_day: 81, end_day: 110 },
      { name: 'Boll Development', start_day: 111, end_day: 150 },
      { name: 'Boll Opening/Harvest', start_day: 151, end_day: 180 }
    ])
  },
  {
    name: 'Sugarcane',
    name_hi: 'गन्ना',
    category: 'cash_crop',
    avg_duration_days: 360,
    stages: JSON.stringify([
      { name: 'Germination', start_day: 0, end_day: 35 },
      { name: 'Tillering', start_day: 36, end_day: 100 },
      { name: 'Grand Growth', start_day: 101, end_day: 250 },
      { name: 'Maturity/Ripening', start_day: 251, end_day: 360 }
    ])
  },
  {
    name: 'Soybean',
    name_hi: 'सोयाबीन',
    category: 'oilseed',
    avg_duration_days: 100,
    stages: JSON.stringify([
      { name: 'Germination', start_day: 0, end_day: 10 },
      { name: 'Seedling', start_day: 11, end_day: 25 },
      { name: 'Vegetative Growth', start_day: 26, end_day: 45 },
      { name: 'Flowering', start_day: 46, end_day: 60 },
      { name: 'Pod Formation', start_day: 61, end_day: 80 },
      { name: 'Maturity', start_day: 81, end_day: 100 }
    ])
  },
  {
    name: 'Mustard',
    name_hi: 'सरसों',
    category: 'oilseed',
    avg_duration_days: 120,
    stages: JSON.stringify([
      { name: 'Germination', start_day: 0, end_day: 10 },
      { name: 'Seedling', start_day: 11, end_day: 25 },
      { name: 'Rosette Stage', start_day: 26, end_day: 40 },
      { name: 'Flowering', start_day: 41, end_day: 65 },
      { name: 'Pod Formation', start_day: 66, end_day: 90 },
      { name: 'Maturity', start_day: 91, end_day: 120 }
    ])
  }
];

function seedCrops(db) {
  const existing = db.prepare('SELECT COUNT(*) as count FROM crops').get();
  if (existing.count > 0) {
    console.log('Crops already seeded, skipping...');
    return;
  }

  const insert = db.prepare(
    'INSERT INTO crops (name, name_hi, category, avg_duration_days, stages) VALUES (?, ?, ?, ?, ?)'
  );

  const seedAll = db.transaction(() => {
    for (const crop of crops) {
      insert.run(crop.name, crop.name_hi, crop.category, crop.avg_duration_days, crop.stages);
    }
  });

  seedAll();
  console.log(`Seeded ${crops.length} reference crops`);
}

module.exports = { seedCrops };
