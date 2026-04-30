'use strict';

require('dotenv').config();

const num = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

module.exports = {
  WEIGHTS: {
    recency: num(process.env.PROP_WEIGHT_RECENCY, 0.4),
    frequency: num(process.env.PROP_WEIGHT_FREQUENCY, 0.3),
    engagement: num(process.env.PROP_WEIGHT_ENGAGEMENT, 0.3),
  },

  // Recency: days since last purchase → score
  RECENCY_TIERS: [
    { maxDays: 7, score: 100 },
    { maxDays: 30, score: 80 },
    { maxDays: 60, score: 50 },
    { maxDays: 120, score: 25 },
    { maxDays: Infinity, score: 5 },
  ],

  // Frequency: number of purchases in a window
  FREQUENCY_WINDOW_DAYS: num(process.env.PROP_FREQUENCY_WINDOW_DAYS, 90),
  FREQUENCY_TIERS: [
    { minCount: 5, score: 100 },
    { minCount: 3, score: 60 },
    { minCount: 1, score: 30 },
    { minCount: 0, score: 0 },
  ],

  // Engagement: non-purchase events in a window
  ENGAGEMENT_WINDOW_DAYS: num(process.env.PROP_ENGAGEMENT_WINDOW_DAYS, 30),
  ENGAGEMENT_TIERS: [
    { minCount: 20, score: 100 },
    { minCount: 10, score: 70 },
    { minCount: 5, score: 50 },
    { minCount: 1, score: 25 },
    { minCount: 0, score: 0 },
  ],
};
