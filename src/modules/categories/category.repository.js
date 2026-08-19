import Category from "./category.model.js";

// ============================================================
// CREATE CATEGORY
// ============================================================

export const createCategory = async (data) => {
  return Category.create(data);
};

// ============================================================
// FIND CATEGORY BY ID
// ============================================================

export const findCategoryById = async (categoryId) => {
  return Category.findById(categoryId);
};

// ============================================================
// FIND CATEGORY BY SLUG
// ============================================================

export const findCategoryBySlug = async (slug) => {
  return Category.findOne({
    slug,
  });
};

// ============================================================
// FIND CATEGORY BY NAME
// ============================================================

export const findCategoryByName = async (name) => {
  return Category.findOne({
    name: {
      $regex: `^${name}$`,
      $options: "i",
    },
  });
};

// ============================================================
// GET ALL ACTIVE CATEGORIES
// ============================================================

export const findActiveCategories = async () => {
  return Category.find({
    isActive: true,
  }).sort({
    sortOrder: 1,
    name: 1,
  });
};

// ============================================================
// GET ALL CATEGORIES
// ============================================================

export const findAllCategories = async () => {
  return Category.find().sort({
    sortOrder: 1,
    createdAt: -1,
  });
};

// ============================================================
// UPDATE CATEGORY
// ============================================================

export const updateCategory = async (
  categoryId,
  updateData
) => {
  return Category.findByIdAndUpdate(
    categoryId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );
};

// ============================================================
// DELETE CATEGORY
// ============================================================

export const deleteCategory = async (categoryId) => {
  return Category.findByIdAndDelete(categoryId);
};