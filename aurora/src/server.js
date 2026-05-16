//save user info and check USGS on a backend server, only sending info when necessary
//cors
const express = require('express')
const webpush = require('web-push')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
app.use(bodyParser.json())
app.use(cors({origin:'github.io'}))
const publicKey = 'BEtt61aFqCxky6cgDyTKsU9RCZKV040JkcQhhUWjwa3fYYGPvxplAFpZwiW-CYqosJjZlL_xJzE8Ucz7FXFnMi8'
const privateKey = '77V7Oz9ZvKDJhqDXeT8jVTauC0HqSI9gEE9hj_21rIg'

webpush.setVapidDetails('mailto:jasperhung888@gmail.com',publicKey,privateKey)
let subscription = null
let lastQuakeId = null

app.post('/subscribe',(req,res)=>{
	subscription = req.body;
	res.status(201).json({});
})

async function checkQuake(){
    if(!subscription){
        return
    }
    try{
        let data=await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson")
        let i = 0
        let info = await data.json()
        /*this fetched data looks something like this:
        {"features":[{"properties":{"mag":1.56,"place":"18 km SSE of Silver Springs, Nevada",
        "time":1778440692573,"ids":",nn00918262,"},
        "geometry":{"type":"Point","coordinates":[-119.1259,39.2671,4.4911]},"id":"nn00918262"}, */
        while(i < info.features.length){

            if(info.features[i].id!=lastQuakeId){
                let tosend = JSON.stringify({
                    title: `An earthquake occured of ${info.features[i].properties.mag} magnitude!!!`,
                    body:info.features[i].properties.place
                })
                await webpush.sendNotification(subscription,tosend)
            }else{
                console.log('notnew')
                lastQuakeId = info.features[0].id
                break
            }
            i+=1
        }
    }catch(error){
        console.log('retrying in 3 seconds')
    }
}


setInterval(() => {
    checkQuake()
}, 3000);

app.listen(3000)

