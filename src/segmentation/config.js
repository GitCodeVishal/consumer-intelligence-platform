'use strict';

require('dotenv').config();

const num = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

module.exports = {
  HIGH_VALUE_THRESHOLD: num(process.env.SEG_HIGH_VALUE_THRESHOLD, 500),
  DORMANT_DAYS: num(process.env.SEG_DORMANT_DAYS, 60),
  CROSS_BRAND_ACTIVE_DAYS: num(process.env.SEG_CROSS_BRAND_ACTIVE_DAYS, 90),
  CROSS_BRAND_MIN_BRANDS: num(process.env.SEG_CROSS_BRAND_MIN_BRANDS, 2),
  LIFECYCLE_WINDOW_DAYS: num(process.env.SEG_LIFECYCLE_WINDOW_DAYS, 60),
};
