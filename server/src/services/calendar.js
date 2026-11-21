function generateCalendar(farmerCrop) {
  const events = [];
  const sowingDate = new Date(farmerCrop.sowing_date);
  const cropName = farmerCrop.crop_name || 'Crop';
  const duration = farmerCrop.avg_duration_days || 120;

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
  }

  // Land Preparation (7-3 days before sowing)
  events.push({
    activity_type: 'land_preparation',
    title: 'Land Preparation - Ploughing',
    description: `Plough the field 2-3 times for ${cropName}. Remove weeds and crop residues. Level the field for uniform irrigation.`,
    scheduled_date: addDays(sowingDate, -7)
  });

  events.push({
    activity_type: 'land_preparation',
    title: 'Soil Treatment & Basal Fertilizer',
    description: `Apply basal dose of fertilizer (DAP/SSP) and soil treatment as per soil test recommendations for ${cropName}.`,
    scheduled_date: addDays(sowingDate, -3)
  });

  // Sowing
  events.push({
    activity_type: 'sowing',
    title: `${cropName} Sowing`,
    description: `Sow ${cropName} seeds. Ensure proper seed rate, depth, and spacing. Use treated seeds if available.`,
    scheduled_date: addDays(sowingDate, 0)
  });

  // First irrigation (3-5 days after sowing)
  events.push({
    activity_type: 'irrigation',
    title: 'First Irrigation',
    description: `Provide first irrigation to ${cropName} field. Light irrigation for seed germination.`,
    scheduled_date: addDays(sowingDate, 3)
  });

  // Germination check (7-10 days)
  events.push({
    activity_type: 'monitoring',
    title: 'Germination Check',
    description: `Check germination rate of ${cropName}. If germination is below 70%, consider gap filling or re-sowing.`,
    scheduled_date: addDays(sowingDate, 8)
  });

  // First weeding (15-20 days)
  events.push({
    activity_type: 'weed_management',
    title: 'First Weeding',
    description: `Remove weeds from ${cropName} field. Use manual weeding or recommended herbicides. Weeds compete for nutrients and water.`,
    scheduled_date: addDays(sowingDate, 18)
  });

  // First top dressing (20-25 days)
  events.push({
    activity_type: 'fertilizer',
    title: 'First Top Dressing - Nitrogen',
    description: `Apply first dose of urea/nitrogen fertilizer to ${cropName}. Follow soil test recommendations. Apply when soil is moist.`,
    scheduled_date: addDays(sowingDate, 22)
  });

  // Second irrigation (20-25 days)
  events.push({
    activity_type: 'irrigation',
    title: 'Second Irrigation',
    description: `Provide second irrigation to ${cropName}. Adjust based on soil moisture and rainfall.`,
    scheduled_date: addDays(sowingDate, 25)
  });

  // Pest monitoring (25-30 days)
  events.push({
    activity_type: 'pest_monitoring',
    title: 'Pest Monitoring - Early Stage',
    description: `Scout ${cropName} field for early pest and disease signs. Check leaf colour, stem health, and look for insects. Report any issues immediately.`,
    scheduled_date: addDays(sowingDate, 28)
  });

  // Second weeding (30-35 days)
  events.push({
    activity_type: 'weed_management',
    title: 'Second Weeding',
    description: `Second round of weeding for ${cropName}. Inter-cultivation to break soil crust and improve aeration.`,
    scheduled_date: addDays(sowingDate, 32)
  });

  // Third irrigation (35-40 days)
  events.push({
    activity_type: 'irrigation',
    title: 'Third Irrigation',
    description: `Provide irrigation to ${cropName}. Critical stage for vegetative growth. Ensure adequate moisture.`,
    scheduled_date: addDays(sowingDate, 38)
  });

  // Second top dressing (40-45 days)
  events.push({
    activity_type: 'fertilizer',
    title: 'Second Top Dressing',
    description: `Apply second dose of nitrogen and potash to ${cropName}. Important for flowering and grain formation.`,
    scheduled_date: addDays(sowingDate, 42)
  });

  // Mid-season pest check (45-50 days)
  events.push({
    activity_type: 'pest_monitoring',
    title: 'Mid-Season Pest & Disease Check',
    description: `Thorough inspection of ${cropName} for diseases and pests. Apply recommended pesticides if needed. Use IPM practices.`,
    scheduled_date: addDays(sowingDate, 48)
  });

  // Flowering stage irrigation (50-60 days)
  events.push({
    activity_type: 'irrigation',
    title: 'Flowering Stage Irrigation',
    description: `Critical irrigation during flowering/reproductive stage of ${cropName}. Water stress during this stage reduces yield significantly.`,
    scheduled_date: addDays(sowingDate, Math.min(55, Math.floor(duration * 0.45)))
  });

  // Micronutrient spray (55-65 days)
  events.push({
    activity_type: 'fertilizer',
    title: 'Micronutrient Foliar Spray',
    description: `Apply foliar spray of zinc sulphate or other micronutrients to ${cropName} as per deficiency symptoms. Best done in morning or evening.`,
    scheduled_date: addDays(sowingDate, Math.min(60, Math.floor(duration * 0.5)))
  });

  // Late season pest monitoring (70-80 days)
  events.push({
    activity_type: 'pest_monitoring',
    title: 'Late Season Pest Monitoring',
    description: `Monitor ${cropName} for late-season pests and grain-filling issues. Watch for storage pests if near harvest.`,
    scheduled_date: addDays(sowingDate, Math.min(75, Math.floor(duration * 0.65)))
  });

  // Grain filling irrigation (75-85 days)
  events.push({
    activity_type: 'irrigation',
    title: 'Grain Filling Irrigation',
    description: `Irrigation during grain filling stage of ${cropName}. Last critical irrigation before maturity.`,
    scheduled_date: addDays(sowingDate, Math.min(80, Math.floor(duration * 0.7)))
  });

  // Pre-harvest assessment (duration - 15 days)
  events.push({
    activity_type: 'monitoring',
    title: 'Pre-Harvest Assessment',
    description: `Assess ${cropName} maturity. Check grain moisture content. Plan harvest logistics - labour, machinery, storage.`,
    scheduled_date: addDays(sowingDate, duration - 15)
  });

  // Stop irrigation before harvest (duration - 10 days)
  events.push({
    activity_type: 'irrigation',
    title: 'Stop Irrigation',
    description: `Stop irrigation for ${cropName}. Allow field to dry before harvest for easier harvesting and better grain quality.`,
    scheduled_date: addDays(sowingDate, duration - 10)
  });

  // Harvest (duration days)
  events.push({
    activity_type: 'harvest',
    title: `${cropName} Harvest`,
    description: `Harvest ${cropName} when mature. Check grain moisture (14-16% for most cereals). Thresh and dry properly. Store in clean, dry place.`,
    scheduled_date: addDays(sowingDate, duration)
  });

  // Post-harvest
  events.push({
    activity_type: 'post_harvest',
    title: 'Post-Harvest Processing',
    description: `Dry ${cropName} produce to safe moisture level. Clean and grade. Store in proper containers. Consider selling at MSP if applicable.`,
    scheduled_date: addDays(sowingDate, duration + 5)
  });

  return events;
}

module.exports = { generateCalendar };
