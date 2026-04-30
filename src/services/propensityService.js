'use strict';

const { StatusCodes } = require('http-status-codes');
const userRepository = require('../repositories/userRepository');
const eventRepository = require('../repositories/eventRepository');
const config = require('../scoring/config');
const {
  scoreRecency,
  scoreFrequency,
  scoreEngagement,
} = require('../scoring/components');
const { generateRationale } = require('../scoring/rationale');
const AppError = require('../utils/AppError');

const round2 = (n) => Math.round(n * 100) / 100;

const compute = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError(`User not found: ${userId}`, StatusCodes.NOT_FOUND);
  }

  const [lastPurchaseAt, purchaseCount, engagementCount] = await Promise.all([
    eventRepository.getLastPurchaseAt(userId),
    eventRepository.getPurchaseCountSince(userId, config.FREQUENCY_WINDOW_DAYS),
    eventRepository.getEngagementCountSince(userId, config.ENGAGEMENT_WINDOW_DAYS),
  ]);

  const recency = scoreRecency(lastPurchaseAt);
  const frequency = scoreFrequency(purchaseCount);
  const engagement = scoreEngagement(engagementCount);

  const w = config.WEIGHTS;
  const rawScore =
    recency.score * w.recency +
    frequency.score * w.frequency +
    engagement.score * w.engagement;
  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  const rationale = generateRationale({
    recency,
    frequency,
    engagement,
    finalScore,
  });

  return {
    user_id: Number(userId),
    score: finalScore,
    rationale,
    components: {
      recency: { ...recency, weight: w.recency, weighted: round2(recency.score * w.recency) },
      frequency: { ...frequency, weight: w.frequency, weighted: round2(frequency.score * w.frequency) },
      engagement: { ...engagement, weight: w.engagement, weighted: round2(engagement.score * w.engagement) },
    },
    config: {
      frequency_window_days: config.FREQUENCY_WINDOW_DAYS,
      engagement_window_days: config.ENGAGEMENT_WINDOW_DAYS,
      weights: w,
    },
  };
};

module.exports = { compute };
