//asks for permission, registers ServiceWorker
let lastQuakeId = null

allownotfi = document.getElementById('allownotfi')
allownotfi.onclick = async function(){
    if(Notification.permission=='granted'){
        console.log('permission has already been granted')
        new Notification('Notifications have already been granted')
        return
    }else{
        if(!("Notification" in window)){
            console.log("this browser doesn't support permissions")
            new Notification('Notifications have already been enabled')
        }else{
            Notification.requestPermission().then((permission)=>{
                if(permission=='granted'){
                    console.log('access grnated!')
                    var a = new Notification("Notifications have been enabled",{body:"test notification"})
                    console.log()
                }else{
                    console.log('acess denied ?')
                }
            })
        }
    }
}

async function checkQuake(){
    try{
        let data=await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson")
        let newEarthquakes = []
        let i = 0
        let info = await data.json()
        /*this fetched data looks something like this:
        {"features":[{"properties":{"mag":1.56,"place":"18 km SSE of Silver Springs, Nevada",
        "time":1778440692573,"ids":",nn00918262,"},
        "geometry":{"type":"Point","coordinates":[-119.1259,39.2671,4.4911]},"id":"nn00918262"}, */
        if(lastQuakeId==null){
            lastQuakeId =info.features[0].id
            return
        }
        while(i < info.features.length){

            if(info.features[i].id!=lastQuakeId){
                new Notification(`An earthquake occured of ${info.features[i].properties.mag} magnitude!!!`,{body:info.features[i].properties.place})
                newEarthquakes.push([info.features[i].id,info.features[i].properties.mag,info.features[i].properties.place])
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

//next we will have it poll https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson every 3 seconds and fi there is no change then dont send notification else send notification, save the mag(calc), place(calc),and time(checking for duplicates)
setInterval(async()=>{
    await checkQuake()
}, 3000);