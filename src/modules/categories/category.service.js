import ApiError from "../../utils/ApiError.js";

import {
  createCategory,
  findCategoryById,
  findCategoryBySlug,
  findCategoryByName,
  findActiveCategories,
  findAllCategories,
  updateCategory,
  deleteCategory,
} from "./category.repository.js";

// ============================================================
// CREATE CATEGORY
// ============================================================

export const createNewCategory = async (data) => {
  const {
    name,
    slug,
    description,
    image,
    sortOrder,
  } = data;

  if (!name) {
    throw new ApiError(
      400,
      "Category name is required"
    );
  }

  const existingName =
    await findCategoryByName(name);

  if (existingName) {
    throw new ApiError(
      409,
      "Category already exists"
    );
  }

  const categorySlug =
    slug ||
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const existingSlug =
    await findCategoryBySlug(categorySlug);

  if (existingSlug) {
    throw new ApiError(
      409,
      "Category slug already exists"
    );
  }

  const category =
    await createCategory({
      name: name.trim(),
      slug: categorySlug,
      description:
        description?.trim() || "",
      image: image || null,
      sortOrder: sortOrder || 0,
    });

  return category;
};

// ============================================================
// GET ACTIVE CATEGORIES
// ============================================================

export const getCategories = async () => {
  return findActiveCategories();
};

// ============================================================
// GET ALL CATEGORIES - ADMIN
// ============================================================

export const getAllCategories = async () => {
  return findAllCategories();
};

// ============================================================
// GET CATEGORY BY ID
// ============================================================

export const getCategory = async (
  categoryId
) => {
  const category =
    await findCategoryById(categoryId);

  if (!category) {
    throw new ApiError(
      404,
      "Category not found"
    );
  }

  return category;
};

// ============================================================
// UPDATE CATEGORY
// ============================================================

export const updateExistingCategory = async (
  categoryId,
  data
) => {
  const category =
    await findCategoryById(categoryId);

  if (!category) {
    throw new ApiError(
      404,
      "Category not found"
    );
  }

  const updateData = {};

  if (data.name !== undefined) {
    updateData.name =
      data.name.trim();
  }

  if (data.slug !== undefined) {
    updateData.slug =
      data.slug
        .trim()
        .toLowerCase();
  }

  if (data.description !== undefined) {
    updateData.description =
      data.description.trim();
  }

  if (data.image !== undefined) {
    updateData.image =
      data.image;
  }

  if (data.sortOrder !== undefined) {
    updateData.sortOrder =
      data.sortOrder;
  }

  if (data.isActive !== undefined) {
    updateData.isActive =
      data.isActive;
  }

  const updatedCategory =
    await updateCategory(
      categoryId,
      updateData
    );

  return updatedCategory;
};

// ============================================================
// DELETE CATEGORY
// ============================================================

export const removeCategory = async (
  categoryId
) => {
  const category =
    await findCategoryById(categoryId);

  if (!category) {
    throw new ApiError(
      404,
      "Category not found"
    );
  }

  await deleteCategory(categoryId);

  return {
    deleted: true,
    categoryId,
  };
};