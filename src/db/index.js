import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import 'dotenv/config'

const connectDB = async ()=>{ // async function 
    try {
       const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       // connection hone ke baad jo bhi response aa rha hai use hum ek variable me store kar lenge 
       // object bhi ho sakta hai 
       console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`)  // gives connectio host 
    //    console.log(connectionInstance) // there are manythings to access, 
    } catch (error) {
        console.log("MONGODB connection FAILED",error)
        process.exit(1)  // we can also throw but node has "process" to end process and exit , there are different operation code like ,0,1,2 for exit
        // read about process from docs 
    }
}
// connectDB()
export default connectDB
// when we use default in export means that , there is only that thing to export from this file and export that thing
// ans one can call that file with any name sice it was the only variable that is being exported from that file