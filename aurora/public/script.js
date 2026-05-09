//asks for permission, registers ServiceWorker
allownotfi = document.getElementById('allownotfi')
allownotfi.onclick = async function(){
    if(Notification.permission=='granted'){
        console.log('permission has already been granted')
    }else{
        if(!(Notification in window)){
            console.log("this browser doesn't support permissions")
            new Notification('Notifications have already been enabled')
        }else{
            Notification.requestPermission().then(()=>{
                if(Notification.permission=='granted'){
                    console.log('access grnated!')
                    new Notification('Notifications have been enabled')
                }else{
                    console.log('acess denied ?')
                }
            })
        }
    }
}