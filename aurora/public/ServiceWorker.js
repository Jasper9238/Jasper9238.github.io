
self.addEventListener('push',(event)=>{
	let payload = {title:'Earthquake Alert!', body:'Shaking Detected'};
	if(event.data){
		try{
			payload = event.data.json()
		}
		catch(err){
			payload.body = event.data.text()
		}
	}
	const options = {
		body:payload.body,
		icon: './icon.png',
		vibrate: [300,100,300],
		data:{
			dateOfArrival: Date.now()
		}

	}
	event.waitUntil(
		self.registration.showNotification(payload.title,options)
	)
	
})