import Category from "../models/categoryModel.js";
import AppError from "../utils/appError.js";

export const createCategory = async (req, res, next) => {
  try {
    const { name, icon } = req.body;
    const nameLowercase = name.toLowerCase();

    const existingCategory = await Category.findOne({
      name: nameLowercase,
    });

    if (existingCategory) {
      return next(new AppError("Category is already existed", 409));
    }

    const category = await Category.create({
      name: nameLowercase,
      ...(icon !== undefined && { icon }),
    });

    return res
      .status(201)
      .json({ message: "Category Created Successfully", data: { category } });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { name, icon } = req.body;
    const id = req.params?.id;

    if (!id) {
      return next(new AppError("Category ID is required", 400));
    }

    const category = await Category.findById(id);

    if (!category) {
      return next(new AppError("Category is not available", 404));
    }

    // Duplicate check (only if name is available)
    if (name) {
      const existing = await Category.findOne({ name: name.toLowerCase() });
      if (existing && existing._id.toString() !== id) {
        return next(new AppError("Category already exists", 409));
      }

      category.name = name.toLowerCase();
    }

    if (icon !== undefined) {
      category.icon = icon;
    }

    await category.save();

    // await category.save();

    return res.status(200).json({ message: "Category Updated Successfully" });
  } catch (error) {
    next(error);
  }
};

export const toggleCategoryStatus = async (req, res, next) => {
  try {
    if (!req.params)
      return next(
        new AppError("Invalid Request! Id is missing in params", 400),
      );
    const id = req.params?.id;

    const category = await Category.findById(id);

    if (!category) {
      return next(new AppError("Category is not available", 404));
    }

    category.isActive = !category.isActive;
    await category.save();

    return res
      .status(200)
      .json({ message: "Category Status updated Successfully" });
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (req, res, next) => {
  try {
    const categories = await Category.find({
      isActive: true,
    });

    return res.status(200).json({ message: "", data: categories });
  } catch (error) {
    next(error);
  }
};

export const getAdminCategories = async (req, res, next) => {
  try {
    let { status } = req.query;

    let filter = {};
    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    const categories = await Category.find(filter);

    return res.status(200).json({ message: "", data: categories });
  } catch (error) {
    next(error);
  }
};
