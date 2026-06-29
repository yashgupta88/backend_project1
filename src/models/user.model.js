// user model from the gven eraser link for model structure for videotube 
// https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj

//  --> there is no need to give a "id" to user or any "field"  beacuse mongodb already generates a unique id 
// bson data me save karta hai , json me nhi karta hai 

// avatar and cover image ke liye hum third part use karke url le lenge aur use string ki form me use karenge,
// third party app can be cloudinary or aws etc 

/*
By default, Mongoose adds an _id property to your schemas.
When you create a new document with the automatically added _id property, Mongoose creates a new _id of type ObjectId to your document.
 */

// import mongoose , {Schema} from "mongoose"  // destructuring mongoose 
// const userSchema = new Schema({})

// or

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema=new mongoose.Schema({

    // model structure link us given above , follow that up

    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,// converts username to lowercase to store in data base 
        trim:true,// to avoid front and last spaces 
        index:true,// to make it available for searching in database 
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,// converts username to lowercase to store in data base 
        trim:true,// to avoid front and last spaces 
        
    },
    fullName:{
        type:String,
        required:true,
        trim:true,// to avoid front and last spaces 
        index:true
        
    },
    avatar:{
        type:String, // cloudinary url
        required:true,
    },
    coverImage:{
        type:String,  // cloudinary url 
       
    },
    watchHistory:[
        {
          type:mongoose.Schema.Types.ObjectId,
          ref:"Video"
        }
      
        
    ],
    password:{
        type:String,  // database me jab bhi password rakho , toh encrypt kar ke rakho , data base leak ho jate hai , we will solve this problem 
        required:[true,'Password is required'], // true field ke sath hum ek custom message bhi de sakte hai 


    },
    refreshToken:{
        type:String
    }
    // what are tokens and what is meant by refreshToken and accessToken 
},{timestamps:true  /* for createdAt and updatedAt */})


userSchema.pre("save", async function(next){  // pre is a hook(middleware) which works just before the given event 
    //  declare this function as 'Function(){}' not like '()=>{}' because here "this" is needed which arrow function has not  
    if(!this.isModified("password")) return next;

    // agar password me change hai tabhi dubara encrypt karo , warna nhi karo 

    this.password=await bcrypt.hash(this.password,10) // kitne bhi hash rounds de sakte ho , ya by default chod do 
    return next // pass flag to next 
})  

// we can also make custom methods aur kuch methods already milte hai 

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)  // given password and hashed password 
    // it returns true or false 
}

/*
in mongoose hooks and middleware are essentially the same things and they usually mean the same feature 
---> it is a function that runs before or after some action 
pre=before 
save=save operation 

so the function runs before saving the document 
 */

// Now JWT 

// JWT is a bearer token ---> bearer token means , jo usko bear karta hai , hum usko shi maan lete hai 
// it is like a key , jo bhi mujhe ye token bhejega , mai use ye data de dunga 
 // visit jwt.io for details 
 // also read abour jsonWebToken in npm packages 

 // jyadatar ye chize environment variables me likhi jati hai 
 /*
 access token aur refresh token ka secret code and expiry "env" file me daal diya hai 
 secret key ke liye kuch bhi de sakte hai , ya phir "sha256" se generate kara sakte ho ek long string 
 and token expiry me uska lasting time dalenge , ki kitne der tak ye token active rahega 
  ---> if i write "1d" , it means after 1 day , you again need to  get an "access" and "refresh"  token 
  ---? also put 1h means 1 hour etc 

  now generating jwt token

  access token aur refresh token , dono ek hi hai "jwt" token but there is difference in their usage 
  we use both in different ways 

  access tokens are short lived and refresh tokens are long lived , access token ko jaldi 
  expire kar diya jata hai aur refresh token ko thoda long term me 


   // refresh token me hum information kam rakhte hai 

   jab tak hamare paas access token hai tab tak hum koi bhi feature jaha par authentication ki requirement hai , vhi par hum access kar sakte hai , us resource ko , jaise aap agar 
   login ho toh file upload kar lo , lekin agar aap ka login session expire ho gya 
   then apko phir password daalkar login karna padega 
   yha pe hum use karte hai refresh token , 
   refresh token hum database me bhi save karte hai aur user ko bhi dete hai 
   user ko hum validate toh access token se hi karte hai , lekin hum kahte aapko har 
   baar password dalne ki jarurat nhi hai , aap bas ek baar endpoint hit kar do , agar aapka refresh token aur mere paas jo db me refresh token hai , agar ye same honge toh , mai aapko nya access token de dunga 
  */

  userSchema.methods.generateAccessToken=function(){
    // is process me time nhi lagta hai , isliye humne async await ka use nhi kiya 
   return jwt.sign(
        {
            // payload or data 
            _id : this._id,  
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            // expiry 
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY  
        }
    )
  }
  userSchema.methods.generateRefreshToken=function(){
     return jwt.sign(
        {
            // payload or data 
            _id : this._id,  
           // refresh token me hum information kam rakhte hai 
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            // expiry 
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY  
        }
    )
  }




export const User=mongoose.model("User",userSchema)
// mongoDB me iska name "users"  ho jaega 


/*
we are going to install "bcrypt" for hashing of password , or we can also use "bcrypt js "
bcrypt is a password protector , when a user signs up , you should never store the actual password in 
the database , if the database gets leaked , everyone can see the passwords

befor saving the passwords , bcrypt converts it into a scrambled form called a hash 
looks like ---> $2b$10$X$8Kj...

user enters password , password hashed using "bcrypt.hash"  and hashed password is saved 

during login we campare user given password with stored hashed password by "bcrypt.compare"

bcrypt and bcryptjs both give same answer and same usage and implementation j just the difference is mostly performance and installation
bcrypt is faster 

npm i bcrypt


-------------------------------------->>>>

Tokens ke liye hum use karne wale hai 
JWT -->  Json Web token (library ) 

A token is a temporary ID card that proves a user is logged in 

eg-->
user logs in with email and password --> server verifies them ---> server gives a token ---> user sends that 
token with future requests ---> server checks the token instead of asking for the password every time 

so , a token is basically --->  I am already logged in . Here is my proof 

JWT is --> Json web token , it is a popular format for creating tokens , its just a long string 
JWT usually contains information like "_id","username",digital signature for protection 

and we also have to install jwt , to create token and verify them 

jwt ko ek toh hum logomko data dena hoga aur  signature ke liye kuch secret, to make it unique 

// go to jwt.io for complete structue

token like this --> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30

*/
