import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // automatically converts to lowercase (use this to avoid duplicates (eg. Electronics, electronics))
      trim: true,
      index: true;
    },

    icon: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }, //Automatically adds createAt and updatedAt fields
);

const categoryModel = mongoose.model("Category", categorySchema);

export default categoryModel;
