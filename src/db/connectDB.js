import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const DB = await mongoose.connect(process.env.MONGODB_CONNECTING_URI)
    console.log(`\n MongoDb Connected !! DB Host: ${DB.connection.host}`)
  } catch (error) {
    console.log("MongoDB connection failed: ", error)
    process.exit(1)
  }
}

export default connectDB