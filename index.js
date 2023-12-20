const express=require("express")
const cookieParser=require("cookie-parser")
const port=process.env.port || 5000


const app =express()
// all middlewares.
app.use(express.json())


// all apis.

app.get("/", async(req,res)=>{
    res.send(`this server is running on ${port}`)
})

app.listen(port,()=>{
    console.log(`this server is running on http://localhost:${port}`)
})