import Router from "express"
import {upload} from "../middleware/multer.middleware.js"
import { changeCurrentPassword, getCurrentUser, getUserByUserId, loginUser, logoutUser, registerUser, updateAccountDetails, updateAvatar } from "../controllers/user.controller.js"
import {verifyJWT } from '../middleware/auth.middleware.js'

const router = Router()

router.route('/register').post(upload.single("avatar"), registerUser)
router.route('/login').post(loginUser)



router.route('/logout').post(verifyJWT , logoutUser)
router.route('/change-password').post(verifyJWT, changeCurrentPassword)
router.route('/get-user').get(verifyJWT, getCurrentUser)
router.route('/update-account').patch(verifyJWT , updateAccountDetails)
router.route('/update-avatar').patch(verifyJWT , updateAvatar)
router.route('/get-user/:userId').get(verifyJWT, getUserByUserId)

export default router