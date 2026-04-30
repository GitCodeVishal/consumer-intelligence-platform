'use strict';

const config = require('./config');

const scoreRecency = (lastPurchaseAt, now = new Date()) => {
  if (!lastPurchaseAt) {
    return { score: 0, days_since: null, label: 'never_purchased' };
  }
  const ms = now.getTime() - new Date(lastPurchaseAt).getTime();
  const days = Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)));
  for (const tier of config.RECENCY_TIERS) {
    if (days <= tier.maxDays) return { score: tier.score, days_since: days };
  }
  return { score: 0, days_since: days };
};

const scoreFrequency = (purchaseCount) => {
  for (const tier of config.FREQUENCY_TIERS) {
    if (purchaseCount >= tier.minCount) {
      return {
        score: tier.score,
        purchase_count: purchaseCount,
        window_days: config.FREQUENCY_WINDOW_DAYS,
      };
    }
  }
  return {
    score: 0,
    purchase_count: purchaseCount,
    window_days: config.FREQUENCY_WINDOW_DAYS,
  };
};

const scoreEngagement = (engagementCount) => {
  for (const tier of config.ENGAGEMENT_TIERS) {
    if (engagementCount >= tier.minCount) {
      return {
        score: tier.score,
        event_count: engagementCount,
        window_days: config.ENGAGEMENT_WINDOW_DAYS,
      };
    }
  }
  return {
    score: 0,
    event_count: engagementCount,
    window_days: config.ENGAGEMENT_WINDOW_DAYS,
  };
};

module.exports = { scoreRecency, scoreFrequency, scoreEngagement };
