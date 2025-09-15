 import { Message } from "../models/messageModel.js";
 import {User} from "../models/uesrModel.js";
 import bcrypt from "bcryptjs";
 import jwt from "jsonwebtoken"

 export const register = async(req,res)=>{
    try{
        const{fullName, username, password, confirmPassword, gender} = req.body;
        if(!fullName || !username || !password || !confirmPassword || !gender ){
            return res.status(400).json({meassage: "sabhi fields ko bharna jaruri hai"})
        }
        if(password !== confirmPassword){
            return res.status(400).json({meassage: "tumhara password match nhi ho rha , kya karte ho yaar"})
        }
        const user = await User.findOne({username});
        if(user){
            return res.status(400).json({meassage: "iss naam ka user phele se hai exit karta hai"})
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        // profilePhoto
        const maleProfilePhoto = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const femaleProfilePhoto = `https://avatar.iran.liara.run/public/girl?username=${username}`;
        await User.create({
            fullName,
            username,
            password:hashedPassword,
            profilePhoto: gender === "male" ? maleProfilePhoto:femaleProfilePhoto,
            gender
        });
        
        return res.status(201).json({
            Message: "mubarak ho!, apka account ban gaya hai",
            success: true
        })
    } catch (error){
        console.log(error);
        
    }
 };

 // Login 
 export const login = async (req, res)=>{
    try{
        const { username, password } = req.body;
        if(!username || !password ){
            return res.status(400).json({meassage: "sabhi fields ko bharna jaruri hai"})
        }
        const user = await User.findOne({username});
        if(!user){
            return res.status(400).json({
                Message: "apka username galat hai",
                success: false
            })
        };

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                Message: "apka password galat hai",
                success: false
            })
        };

        const tokenData={
            userId: user._id
        }
        const token  = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {expiresIn:'1d'});

        return res.status(200).cookie("token", token, {maxAge:1*24*60*60*1000, httpOnly : true, sameSite: 'strict'}).json({
           _id:user._id,
           username:user.username,
           fullName:user.fullName,
           profilePhoto:user.profilePhoto 
        });
    

    }catch(error){
        console.log(error);
        
    }
 }

 // logout

 export const logout = (req,res)=>{
    try{
        return res.status(200).cookie("token", "",{maxAge:0}).json({
            Message:"aap logged out ho gaye hai."
        })

    }catch(error){
        console.log(error);
        
    }
 }

 // other user

 export const getOtherUsers = async(req,res)=>{
    try {
        const loggedInUserId = req.id;
        const otherUsers = await User.find({_id:{$ne:loggedInUserId}}).select("-password");
        return res.status(200).json(otherUsers);
    } catch (error) {
        console.log(error);
        
    }
 }
