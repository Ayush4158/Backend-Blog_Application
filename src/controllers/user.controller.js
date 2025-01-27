import {asyncHandler} from '../utils/asyncHandler.js'
import { User } from '../models/user.model.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {ApiError} from '../utils/ApiError.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {unlinkLocalFile} from '../utils/unlinkLocalFile.js'

const generateAccessAndRefreshToken = async(userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken =await user.generateAccessToken()
    const refreshToken =await user.generateRefreshToken()

    await user.save({validateBeforeSave: false})

    return {accessToken, refreshToken}
  } catch (error) {
    throw new ApiError(500 , "Something went wrong while generating the access and refresh token")
  }
}

export const registerUser = asyncHandler(async(req,res) => {
  const {fullname, username , email , password} = req.body

  if([fullname , username, email, password].some((field) => (field?.trim() === ""))){
    throw new ApiError(400, "All fields are required")
  }

  const existedUser = await User.findOne({
    $or: [{email, username}]
  })
  if(existedUser){
    throw new ApiError(409, "user with email and or username already exist")
  }

  const avatarLocalFilePath = req.file?.path
  if(!avatarLocalFilePath){
    throw new ApiError(400 , "Avatar file is required")
  }
  const avatar = await uploadOnCloudinary(avatarLocalFilePath)
  unlinkLocalFile(avatarLocalFilePath)

  const user = await User.create({
    fullname,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatar.url
  }).select("-password -refreshToken")

  // const createdUser = await User.findById(user._id).select("-password -refreshToken")

  if(!createdUser){
    throw new ApiError(500 , "Something went wrong while registering the user")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200 , user , "User registered successfully")
    )
})

export const loginUser = asyncHandler(async(req,res) => {
  const {username , email , password} = req.body

  if(!username && !email){
    throw new ApiError(400 , "username or email is required")
  }

  const user = await User.findOne({
    $or: [{username} , {email}]
  })
  if(!user){
    throw new ApiError(404, "User does not exist")
  }

  const passwordValidation = await user.isPasswordCorrect(password)
  if(!passwordValidation){
    throw new ApiError(401 , "Invalid user credentials")
  }

  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

  const loggedinUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200 , {user: loggedinUser, accessToken, refreshToken} ,"user loggedin successfully")
    )
  
})

export const logoutUser = asyncHandler(async(req,res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new : true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refresToken" , options)
    .json(
      new ApiResponse(200 , {} , "user loggedout successfully")
    )
})

export const changeCurrentPassword = asyncHandler(async(req,res) =>{
  const {oldpassword , newpassword , confirmpassword} = req.body

  if([oldpassword, newpassword, confirmpassword].some((field) => (field.trim() == ""))){
    throw new ApiError(400 , "All fields are required")
  }

  if(newpassword !== confirmpassword){
    throw new ApiError(400 , "invalid confirm password")
  }

  const user = await User.findById(req.user?._id)
  console.log("old: ",user.password)

  const passwordValidation = await user.isPasswordCorrect(oldpassword)
  if(!passwordValidation){
    throw new ApiError(400, "old password is incorrect")
  }

  user.password = confirmpassword
  await user.save({validateBeforeSave: false})

  console.log("new: ",user.password)

  return res
    .status(200)
    .json(
      new ApiResponse(200 , {} , "Password is updated successfully")
    )
})

export const getCurrentUser = asyncHandler(async(req,res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200 , req.user , 'current user fetched successfully')
    )
})

export const updateAccountDetails = asyncHandler(async(req,res) => {
  const {fullname , email} = req.body

  if(!fullname && !email){
    throw new ApiError(400 , "Fullname or email is required")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullname,
        email
      }
    },
    {new : true}
  ).select("-password")

  return res
    .status(200)
    .json(
      new ApiResponse(200 , user , "User accound updated successfully")
    )
})

export const updateAvatar = asyncHandler(async(req,res) => {
  const avatarLocalPath = req.file?.path
  if(!avatarLocalPath){
    throw new ApiError(400 , "avatar file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if(!avatar.url){
    throw new ApiError(400, " Error while uploading on cloudinary")
  }
  
  unlinkLocalFile(avatarLocalPath)

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    {new : true}
  ).select("-password")

  return res
    .status(200)
    .json(
      new ApiResponse(200 , user , "Avatar updated successfully")
    )
})

export const getUserByUserId = asyncHandler(async(req,res) => {
  const {userId} = req.params

  const user = await User.findById(userId)

  if(!user){
    throw new ApiError(404 , "User not found")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200 , user , "User fetched successfully")
    )
})
