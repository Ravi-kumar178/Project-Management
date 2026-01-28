import mongoose from "mongoose";

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connection established");
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};

export default dbConnect;
