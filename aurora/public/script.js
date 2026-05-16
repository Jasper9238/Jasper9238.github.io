//asks for permission, registers ServiceWorker
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


const registerServiceWorker = async () => {
	if('serviceWorker' in navigator){
		try{
			const registration = await navigator.serviceWorker.register('./ServiceWorker.js')
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly:true,
                applicationServerKey: 'BEtt61aFqCxky6cgDyTKsU9RCZKV040JkcQhhUWjwa3fYYGPvxplAFpZwiW-CYqosJjZlL_xJzE8Ucz7FXFnMi8'
            })
            await fetch('https://localhost:3000/subscribe',{
                body: JSON.stringify(subscription),
                headers:{
                    'Content-Type': 'application/json'
                }
            })
		}catch (error){
			console.error(`Registration failed with ${error}`)
		}
	}
} 