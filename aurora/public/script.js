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
                    new Notification("Notifications have been enabled")
                }else{
                    console.log('acess denied ?')
                }
            })
        }
    }
}