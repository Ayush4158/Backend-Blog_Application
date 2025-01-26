import {app} from "./app.js"
import dotenv from "dotenv"
import connectDB from "./db/connectDB.js"

dotenv.config({
  path: './env'
})

connectDB()
.then(() => {
  app.on("error" , (error) => {
    console.log("Error: ", error)
    throw error
  })

  app.listen(process.env.PORT || 7000, () => {
    console.log(`Server is running on port: ${process.env.PORT}`)
  })
})
.catch((error) => {
  console.log("MongoDB connection failed !! " , error)
})

// app.get('/hello' , (req,res) => {
//   res.send("hello sir")
// })