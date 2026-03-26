import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import {
  createCategoryValidator,
  updateCategoryValidator,
} from "../validators/categoryValidator.js";
import validateData from "../middleware/validate.js";
import allowRoles from "../middleware/roleMiddleware.js";
import {
  createCategory,
  getAdminCategories,
  getCategory,
  toggleCategoryStatus,
  updateCategory,
} from "../controllers/categoryController.js";

const route = express.Router();

route.post(
  "/",
  verifyToken,
  allowRoles("admin"),
  createCategoryValidator,
  validateData,
  createCategory,
);

route.put(
  "/:id",
  verifyToken,
  allowRoles("admin"),
  updateCategoryValidator,
  validateData,
  updateCategory,
);

route.patch("/:id", verifyToken, allowRoles("admin"), toggleCategoryStatus);

route.get("/", getCategory);

route.get("/admin", verifyToken, allowRoles("admin"), getAdminCategories);

export default route;
