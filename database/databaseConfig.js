import mongoose from "mongoose";

// Connect to MongoDB.
const connectDB = async (mongoURI) => {
  try {
    const connection = await mongoose.connect(mongoURI);
    console.info(
      `MongoDB database connected successfully`,
    );
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1); // fail fast in production
  }
};

export default connectDB;
