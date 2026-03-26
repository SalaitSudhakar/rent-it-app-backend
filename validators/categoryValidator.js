import { body } from "express-validator";

/**
 * CREATE CATEGORY
 * name, optional icon
 */
export const createCategoryValidator = [
  // name
  body("name")
    .trim()
    .notEmpty()
    .withMessage("category name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Category name must be between 3 and 50 characters")
    .toLowerCase(),

  // optional icon
  body("icon")
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9-]+/)
    .withMessage("Icon must be a valid icon name"),
];

/**
 * Edit CATEGORY
 * name, optional icon
 */
export const updateCategoryValidator = [
  // name
  body().custom((value, { req }) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new Error("At least one data required for update category");
    }
    return true;
  }),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("category name cannot be empty")
    .isLength({ min: 3, max: 50 })
    .withMessage("Category name must be between 3 and 50 characters")
    .toLowerCase(),

  // optional icon
  body("icon")
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9-]+/)
    .withMessage("Icon must be a valid icon name"),
];
