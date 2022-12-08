// imports --start

const express = require('express')
require('./config')
const user = require('./db/user')
const product = require('./db/product')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const jwtkey = "e-comWswigty126*hdn#kjdjj64ljon12dkjhsih@3lkn$khbj&nbb~jhk2jhbb"

//import --end

const port = process.env.port || 6500
const app = express()
// middlewares --start
app.use(express.json())
app.use(cors())

// middlewares --end
app.post('/register', async (req, res) => {
    if (req.body.name && req.body.email && req.body.password) {
        const query = new user(req.body)
        let User = await query.save()
        User = User.toObject()
        delete User.password
        jwt.sign({ User }, jwtkey, { expiresIn: "2h" }, (err, token) => {
            if (err) res.send("something whent wrong please try after some time")
            res.send({ User, auth: token })
        })
    }
    else {
        res.send({ result: "values missing !" })
    }
})

//login Route
app.post('/login', async (req, res) => {
    if (req.body.email && req.body.password) {
        let User = await user.findOne(req.body).select("-password  ")  // .select("-password to remove password from result")

        console.log(User)
        if (User) {
            jwt.sign({ User }, jwtkey, { expiresIn: "2h" }, (err, token) => {
                if (err) res.send("something whent wrong please try after some time")
                res.send({ User, auth: token })
            })

        }
        else {
            res.send({ result: "invalid username or password" })
        }

    }
    else {
        res.send({ result: "invalid values" })
    }
})


app.post('/add-product', verifyToken, async (req, res) => {
    console.log(req.body)
    let query = new product(req.body)
    let result = await query.save()
    console.log(result)
    res.send(result)


})

app.get("/products", verifyToken, async (req, res) => { // get all products
    // console.log(req.headers.authorization)
    // console.log("user :",req.headers.user)
    let result = await product.find({ userId: req.headers.user })
    if (result.length != 0) {
        res.send(result)
    }
    else {
        res.send({ result: "Product Not Found !" })
    }
    // console.log("products hitted")

})

app.delete("/products/:id", async (req, res) => {  // to get data for given Id for Update route to empliment form auto form
    let q = JSON.stringify(req.params.id)
    const result = await product.deleteOne({ _id: req.params.id }).select('- userId')
    res.send(result)
    // console.log(req.params.id)

    {
        //   "_id": {
        //     "$oid": "6364f3c6377cf473685dff2e"
        //   },
        //   "name": "apple iphone 12 Pro Max",
        //   "price": 1199,
        //   "category": "mobile",
        //   "company": "apple",
        //   "userId": "63638f4977bb334520e690e2",
        //   "__v": 0
    }
})
//update 
// app.post('/update/:id',async(req,res)=>{
//     console.log(req.params.id)
//     let result=await product.updateOne({_id:req.params.id},{
//         $set:req.body
//     })
// })
app.get('/products/:id', async (req, res) => {
    console.log("Hitted at get data for update ===>>")
    let result = await product.findOne({ _id: req.params.id })
    if (result) {
        // console.log(result)
        res.send(result);
    }
    else {
        res.send({ response: "Result Not Found !" })
    }
})
app.put('/update', async (req, res) => {
    console.log(req.body)
    let result = await product.updateOne({ _id: req.body._id }, {
        $set: {
            name: req.body.name,
            price: req.body.price,
            category: req.body.category,
            company: req.body.company
        }
    })
    res.send(result)
    // console.log(result)
})
//search route to search products from database and display 
app.get('/search/:key', verifyToken, async (req, res) => {  // for search functionality 
    let result = await product.find({
        userId: req.headers.user,
        "$or": [
            { name: { $regex: req.params.key } },
            { company: { $regex: req.params.key } },
            { category: { $regex: req.params.key } },



        ]
    })

    res.send(result)
    console.log("RESULT  of Search API :", result)
})

function verifyToken(req, res, next) {
    let token = req.headers.authorization

    console.log(req.params)
    if (token) {
        console.log(req.headers.authorization)
        jwt.verify(token, jwtkey, (err, valid) => {
            if (err) {
                res.status(401).send(err.message)
                console.log(err)
            } else {
                next()
            }
        })
    }
    else {
        res.send("Please Add Token In Header")
        console.log("Please Add Token In Header")
    }

}
app.listen(port, (err) => {
    if (err) console.log(err)

    console.log("API is running on the port :", port)
})



