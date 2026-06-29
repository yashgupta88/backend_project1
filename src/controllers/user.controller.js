//  main logic wala part hota hai controller , how to write controller ,
// jitna jyada controller likhenge , badi problems ko chote chote me todenge , utna hi logic building acha hoga 

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import validator from 'validator';
import {User} from '../models/user.model.js';
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
import 'dotenv/config'

// method for registering user 
// as we know that whenever we make an app from express we get four parameter out of 
// which two are (req , res)

// const registerUser = asyncHandler(async (req , res)=>{  // takes an function
//     res.status(500).json({
//         message:"Chai aur Code "
//     })
// })

const generateAccessAndRefreshTokens = async (userId)=>{
    try {
        const user=await User.findById(userId); // Note that this user document already knows that this document object is linked to the User model , 
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken;
        // user.save()  // yha pe dikkat ho jaegi kyoki jab bhi hum save karaenge toh pura data hona chahiye , kyoki schema me validatuin laga hua hua 
        // aur agar hum vapas se ek field deke pura document vapas se save karenge toh validation error aa sakti hai , because mongoose all fields in the document before saving
        // so we have to only update refreshToken 
        // so we use validateBeforeSave to save this document without running validation 

        // save is a socument method in mongoose 
        await user.save({validateBeforeSave : false}) // user document me refreshToken chala gya aur database me bhi save ho jaega 

        return {accessToken , refreshToken}  // returning an object with accesstoken and refreshtoken

        
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}
// we want , when ever user login everytime , its refreshtoken got updated in his documnts thats why 
// we are saving it 




// Now we are going to write controller to register user 




const registerUser=asyncHandler(async (req,res)=>{
    // steps
    // get user details from frontend (humare liye frontend ka kaam POSTMAN kar dega )
    // Validation (username shi hai ki nhi , email shi format me hai ya nhi , to check not empty)
    // check if user already exists :(username already exists or email already exists )
    // check for images , check for avatar 
    // upload them to cloudinary , avatar 
    // create user object -- create entry in db (mongo db me bhejne ke liye hum object banaenge )
    // remove password and refresh token field from response (because we dont want to give frontend these fields )
    // ckeck for user creation (user create hua hai ya nhi ya null aaya hai )
    // return response , if user created else return error  



    // jitni bhi details body ya frontend se aaati hai , vo "req.body" me mil jaati hai 
    // jo data form se ya phir direct json se data aa rha hai vo req.body me jaega 
    // baki url ka data bhi hum dekhenge 

    // Postman me jake hum log params bhi de sakte ha ya phir body me jake data de sakte hai like form data 
    // text etc , hum log form data bhi bhej sakte hai , urlencoded bhi 
    // abhi ke liye hum raw data bhejenge , raw pe jake , seedhe json data de sakte hai .
    // raw mw jake , text me jake JSON select kar lo 

    const {fullName , email , username ,password} = req.body; // using destructuring 
    // console.log("email : " ,email)

    // ----------------------------> validation 


    // if(fullName === "") {
    //     throw new ApiError(400 , "Fullname is required")
    // }
    // or 
    // in this way we had to write if , else for each fiels , we can use map or something else for that 

    // const arr=[fullName,email,username, password]
    // const newarr=arr.filter((item)=> item.trim()==="")
    // if(newarr.length>0) throw new ApiError(400 , "All fiels are required ")

    // or we can also use some() ,since we only need to know whether at least one field is empty, some()

    if(
        [fullName,email,username,password].some((field)=>field?.trim()=== "")
    ){
        throw new ApiError(400,"All Fields required ")
    }

    
    // if ( (!email.includes("@")) || (!email.includes("gmail.com")) ){
    //     throw new ApiError(400,"Please enter valid email")
    // } // this only works for email and also in only some case 

    // to validate email , either we use regex or validator libraries 

    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    //    if (!emailRegex.test(email)) {
    //        throw new ApiError(400, "Invalid email");
    // }

   // A Regex (Regular Expression) is just a pattern used to check whether a string follows a certain format.
   // Reges has many other properties , you can see in docs 

   /**
    * Most important use library validator.js , to validate , email , password  IMEI number and many more 
    * there are many functinalities it provide , go to npm docs 
    * npm i validator and use 
    * 
    */

   if(!validator.isEmail(email)){  // we can also give options in isEmail , setting props , check in docs 
    throw new ApiError(400 , "Enter valid email")
   }

   if(!validator.isStrongPassword(password)){
    throw new ApiError(400 , "Please enter a strong password.\nMinimum length: 8\nAt least one lowercase letter\nAt least one uppercase letter\nAt least one number\nAt least one symbol" )
   }

   // ---------------------- check whether user exist or not 


   // we take "User" from user model , as it is directly interacting with database 

   const existedUser =await User.findOne({  // findone is an async function and return a promise 
    $or : [{username} ,{email}] // ya toh ye username ho , ya toh ye email ho 
   })  

   if(existedUser){
    throw new ApiError(409 , " User with email or username already exists ")
   }  // we can also check username and email explicitly seperately 


   // sabse pahla user with given details jo find hoga , wo document return karega , we can also find using "find" method , many optiona like updateOne etc are available 

   /**
    
   In MongoDB, $ operators are special keywords used in queries and updates.

   $or  --> Used when any one condition can be true.

   const user = await User.findOne({
    $or: [
        { email: email },
        { username: username }
    ]
    });


    Operator	Purpose
$or ->	At least one condition must be true
$and ->	All conditions must be true , by default if all conditions are given then they are treated as and , so no need to "$and" operator 
$set ->	Update specific fields
$gt ->	Greater than (>)
$lt ->	Less than (<)
$gte ->	Greater than or equal (>=)
$lte ->	Less than or equal (<=)
$in ->	Value is in a list
$ne	-> Not equal
$ -> Positional operator (matched array element) or prefix for MongoDB operators

eg :
User.find({
    age: { $gt: 18 }
});

Age > 18.


   findOne()	                             find()
Returns one document	           Returns all matching documents
Return type: Object (or null)	   Return type: Array

    */

// -------------->  check for images , check for avatar 


// we can take images using req.files , because multer has already added these files and also  provides various methods
// read props  by consoling , req.body and req.files 
// avatar[0] because there are many files inside any fields 

// console.log(req.files);

const avatarLocalPath=req.files?.avatar[0]?.path // check by console log req.files 

// const coverImageLocalPath=req.files?.coverImage[0]?.path

let coverImageLocalPath;
if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
    coverImageLocalPath=req.files.coverImage[0].path;
}

if(!avatarLocalPath){
    throw new ApiError(400 , "Avatar file is required ")
}

// --------------- upload them to cloudinary 

const avatar=await uploadOnCloudinary(avatarLocalPath)
const coverImage=await uploadOnCloudinary(coverImageLocalPath) /// when there is no image , cloudinary automatically gives empty string 

//--------------- check whether avatar is uploaded or not on cloudinary 

if(!avatar){
     throw new ApiError(400 , "Avatar file is required ")
}

// ---------------now create an object and entry in database

const user= await User.create({
    fullName,
    avatar : avatar.url ,// beacuse cloudinary is returning whole response object 
    coverImage: coverImage?.url || "" , // agar coverImage hai toh url nikal ke de do , varna empty string de do 
    email,
    password,
    username : username.toLowerCase()

})

// User.create() is used to create a new document and save it to the MongoDB database in one step.

// if i want to check user is created or not , or empty is returned 
// find that if the user i had created , its id exists in data base or not 
// mongo db already creates an id(_id field ) for every entry in database 
// we can check if user is created or not by finding it by _id , if find then it return 
// that document of user 

// hum chahte toh humne jo uper user create karte waqt document banaya hai usme bhi 
// remove kar sakte the , password or refresh token by using ".select()" 

const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
) // refresh token and password are removed from document 

if(!createdUser){ // if user not created , then null is returned 
    throw new ApiError(500 , "Something went wrong while registering the user ")
}


/**
 * .select() is used to choose which fields you want to return from the database.

Think of it like this:

"Give me only these fields."

or

"Don't give me these fields."

const user = await User.findById(id).select("username email");

Only these fields are returned.

---->  Exclude fields

Prefix the field with "-".

const user = await User.findById(id)
    .select("-password -refreshToken");

    ---> password and refreshToken are excluded from the document you are getting returned from the database after finding 
 */

    //  -----------------> now return response 
    //  but hum response aise nhi send karenge , api me response send  karenge 
    // we are going to use utility of Apiresponse that we had created 
    // we can also send directly "createdUser" , inside json reponse 
    // but we had made Api response so we used it  

    return res.status(201).json(
        new ApiResponse(200 , createdUser , "User registered Successfully ")
    )



})

const loginUser=asyncHandler(async (req,res)=>{
    // req.body --> data
    // username or email
    // find the user 
    //password check 
    // access and refresh token 
    // send these tokens in cookies 

    const {username,email, password} = req.body;

    if (!username && !email){ // dono nhi hai 
        throw new ApiError(400,"username or email is required ")

    }
    // in javascript if an object is like this { username : username } then it can also written as { username }

   
    const user=await User.findOne(
        {
            $or : [{username},{email}]
        }
    )

    if(!user){
        throw new ApiError(404,"User does not exist");
    }

    const isPasswordValid=await user.isPasswordCorrect(password);
    
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user Credentials")
    }

    // now making access and refresh token 

    const {accessToken,refreshToken} =await generateAccessAndRefreshTokens(user._id)

    /*
    Note --> ok now we had to send data to user because when user login , then 
    after it fronted needs some data for ex like for welcome user "welcome Yash" etc 
    so we need to send this document without giving access token and refresh token in the document 

    but we also need to remove password field and refreshtoken field from the document 
    for that we have to use select method , but select method does not fork on already 
    fetched document , so we need to fetch again from database and remove that fields and store it somewhere 

    */

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    // now we had to send them into cookies 

    const options={
        // these options are made to make cookies secure , not modified by frontend , only modified by 
        // server and many sercurity we can apply like used on same site etc 
        // frontend does not read cookie , only browser and server can use it 
        httpOnly : true,
        secure : false
    }

    // we can use cookie parser , because we had injected cookie-parser as middleware in app 
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,
                accessToken,
                refreshToken
                // this access token and reponse token for mobile apps or APIs where the client wants to store the token itself 
                // if we are using HTTP only , its usually unneccsary to also send the tokens in json 
                // it might be dangerous to send access token and refresh token in frontend
            },
            "User logged in Successfully"
        )
    )

    

})

const logoutUSer= asyncHandler(async(req,res)=>{

    // Note -->  A refresh token is not meant to let a user log back in , after they have chosen to log out , instead its purpose is to keep an already logged in user authenticated without asking for their password again when the access token expires , 

    // so in logout , we had to delete both acess token and refresh token both , because , if user clicks log out , it meant to be end my session , so the server should invalidate the refresh token 
    
    /*
    suppose user logs in with email and password 
    server issues AccessToken(15 mins ) and Refresh Tokens (7 days )
    after 15 mins , the access token expires 
    the browser sends the refresh token 
    the server isssues a new access token 
    the user continues using the app without entering the password again 

     */

    // clear cookies and remove refreshToken from the user model 

    // but in logout , how did i get user document , because there is no information given

    // now i had injected jwt authentication before logout , so we had an access to req.user

    // we can make refresh token of user undefined and also save (validate before save : fasle )
    // same as added refreshToken , or we can also do

   await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : { // or we can use unset operator to remove that field
                refreshToken : undefined
            }
        },
        {
            new : true // to create a new documnet , by default old document which is before the update is being returned so we use new
        }
    )

    const options={
      // options are needed to clear cookies , because A cookie is defined not just by its name but also 
      // by its properties like path , secure etc 
      // using the same options ensure the browser identifies the correct cookie to delete 
        httpOnly : true,
        secure : false 
        // make "secure" it true here as well as in logout method 
        // i had made it false to get cookies in Postman , beacuse else Postman is not teking cookies
        // it is taking it only in headers 

        // while development (local host) : secure is false , so cookies work over HTTP
        // Production(deployed with HTTPS ): secure is true , making the cookies more secure 
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"User logged Out")
    )

})

const refreshAccessToken = asyncHandler(async(req,res)=>{

    const incomingRefreshToken=req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ","") || req.body.refreshToken

    if(!incomingRefreshToken){
         throw new ApiError(401 , "Unauthorized access") // Api error sends an api consisting of errors
    }

    try {
         const decodedToken=await jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
         // it just verifies that given token is beging generated by this secret key or not 
         // and returns decoded token , because user gets encrypted one 
         // we also need to verify refresh token from the database , that is it same or not , because 
         // old refreh token may had id of user but not same as current one 
          // we cannot find the user before decoding the token., because decoding the token give an access to id, or data that we had given while creating the token 
          // and verify, verifies as well as returns that decoded token 
    
         if(!decodedToken){
            throw new ApiError(401,"Unauthorized request")
         }
    
        const user=await User.findById(decodedToken._id)
    
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401,"Refresh Token is expired or used") // because id is same but refresh token does not match with the current one from databse 
        }
    
         const {accessToken,newRefreshToken} =await generateAccessAndRefreshTokens(user._id)
    
         const options={
          
            httpOnly : true,
            secure : false
        }
    
         return res
         .status(200)
         .cookie("accessToken",accessToken,options)
         .cookie("refreshToken",newrefreshToken,options)
         .json(
              new ApiResponse(
                200,
                {
                  
                    accessToken,
                    refreshToken:newRefreshToken
                },
                "Access token refreshed "
            )
         )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token ")
    }

})

export {
    registerUser,
    loginUser,
    logoutUSer,
    refreshAccessToken
}