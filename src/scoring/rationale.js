'use strict';

const tierLabel = (score) => {
  if (score >= 80) return 'high';
  if (score >= 50) return 'moderate';
  if (score >= 25) return 'low';
  return 'very low';
};

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const generateRationale = ({ recency, frequency, engagement, finalScore }) => {
  // Special cases first — they short-circuit the tiered logic
  if (recency.label === 'never_purchased' && engagement.score === 0) {
    return 'No purchase or engagement history; no signal to predict imminent purchase.';
  }
  if (recency.label === 'never_purchased') {
    return 'User has engaged with content but never purchased; conversion potential unproven.';
  }
  if (recency.days_since !== null && recency.days_since > 120) {
    return 'Long inactivity since last purchase; low likelihood of imminent purchase.';
  }

  const r = tierLabel(recency.score);
  const f = tierLabel(frequency.score);
  const e = tierLabel(engagement.score);

  if (r === 'high' && f === 'high' && e !== 'very low') {
    return 'Frequent buyer with strong recent engagement; high purchase likelihood.';
  }
  if (r === 'high' && e === 'high' && (f === 'low' || f === 'moderate' || f === 'very low')) {
    return 'Recently active with high engagement but low purchase frequency.';
  }
  if (r === 'high' && f === 'low' && e === 'low') {
    return 'Recent purchase but no follow-up activity; engagement window may be closing.';
  }
  if (f === 'high' && r === 'low') {
    return 'History of frequent purchases but recent dropoff; possible churn risk.';
  }
  if (e === 'high' && r === 'low') {
    return 'High recent browsing/engagement but no recent purchases; conversion-ready.';
  }
  if (r === 'high' && f === 'high') {
    return 'Recent and frequent buyer; strong purchase signal.';
  }

  // General fallback combines the three labels
  return `${capitalize(r)} purchase recency, ${f} frequency, ${e} engagement; final score ${finalScore}.`;
};

module.exports = { generateRationale, tierLabel };
