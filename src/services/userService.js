'use strict';

const { StatusCodes } = require('http-status-codes');
const { sequelize } = require('../models');
const userRepository = require('../repositories/userRepository');
const brandRepository = require('../repositories/brandRepository');
const userBrandRepository = require('../repositories/userBrandRepository');
const AppError = require('../utils/AppError');

const UPDATABLE_FIELDS = [
  'first_name',
  'last_name',
  'gender',
  'date_of_birth',
  'city',
  'country',
  'acquisition_source',
];

const findUserOrThrow = async (id, options = {}) => {
  const user = await userRepository.findById(id, options);
  if (!user) throw new AppError(`User not found: ${id}`, StatusCodes.NOT_FOUND);
  return user;
};

const findBrandOrThrow = async (id, options = {}) => {
  const brand = await brandRepository.findById(id, options);
  if (!brand) throw new AppError(`Brand not found: ${id}`, StatusCodes.NOT_FOUND);
  return brand;
};

const linkOrReactivate = async (userId, brandId, opts, transaction) => {
  const existing = await userBrandRepository.findByUserAndBrand(userId, brandId, {
    transaction,
  });
  if (existing) {
    if (!existing.is_active) {
      await userBrandRepository.setActive(existing, true, { transaction });
    }
    return { association: existing, wasCreated: false };
  }
  const association = await userBrandRepository.create(
    {
      user_id: userId,
      brand_id: brandId,
      registered_at: new Date(),
      acquisition_source: opts.acquisition_source || null,
      is_active: true,
    },
    { transaction }
  );
  return { association, wasCreated: true };
};

const createUser = async (data) => {
  const { email, phone, brand_id, brand_acquisition_source, ...rest } = data;

  if (!email && !phone) {
    throw new AppError(
      'At least one of email or phone is required',
      StatusCodes.BAD_REQUEST
    );
  }

  return sequelize.transaction(async (t) => {
    let user = await userRepository.findByEmailOrPhone(email, phone, {
      transaction: t,
    });
    let wasCreated = false;

    if (!user) {
      user = await userRepository.create(
        { email, phone, ...rest },
        { transaction: t }
      );
      wasCreated = true;
    }

    if (brand_id) {
      await findBrandOrThrow(brand_id, { transaction: t });
      await linkOrReactivate(
        user.id,
        brand_id,
        { acquisition_source: brand_acquisition_source || rest.acquisition_source },
        t
      );
    }

    return { user, wasCreated };
  });
};

const getUserProfile = async (id) => {
  const user = await userRepository.findWithBrandsAndRecentEvents(id, 10);
  if (!user) throw new AppError(`User not found: ${id}`, StatusCodes.NOT_FOUND);
  return user;
};

const updateUser = async (id, data) => {
  const user = await findUserOrThrow(id);
  const updates = {};
  for (const key of UPDATABLE_FIELDS) {
    if (data[key] !== undefined) updates[key] = data[key];
  }
  if (Object.keys(updates).length === 0) {
    throw new AppError('No updatable fields provided', StatusCodes.BAD_REQUEST);
  }
  await user.update(updates);
  return user;
};

const listUsers = async ({ page, limit, filters }) =>
  userRepository.paginate({ page, limit, filters });

const registerUserToBrand = async (userId, brandId, options = {}) => {
  if (!brandId) {
    throw new AppError('brand_id is required', StatusCodes.BAD_REQUEST);
  }
  return sequelize.transaction(async (t) => {
    await findUserOrThrow(userId, { transaction: t });
    await findBrandOrThrow(brandId, { transaction: t });
    return linkOrReactivate(userId, brandId, options, t);
  });
};

const unlinkUserFromBrand = async (userId, brandId) => {
  const assoc = await userBrandRepository.findByUserAndBrand(userId, brandId);
  if (!assoc) {
    throw new AppError(
      `User ${userId} is not associated with brand ${brandId}`,
      StatusCodes.NOT_FOUND
    );
  }
  if (assoc.is_active) {
    await userBrandRepository.setActive(assoc, false);
  }
  return assoc;
};

module.exports = {
  createUser,
  getUserProfile,
  updateUser,
  listUsers,
  registerUserToBrand,
  unlinkUserFromBrand,
};
