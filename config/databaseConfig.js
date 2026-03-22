import mongoose from "mongoose";

// Connect to MongoDB.
const connectDB = async () => {
  const mongodbURI = process.env.MONGODB_URI;

  if (!mongodbURI) {
    console.error("MongoDB URI is missing");
    process.exit(1); // terminate code if URI missing
  }

  try {
    const connection = await mongoose.connect(mongodbURI);
    console.info(`MongoDB database connected successfully`);
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1); // fail fast in production
  }
};

export default connectDB;
