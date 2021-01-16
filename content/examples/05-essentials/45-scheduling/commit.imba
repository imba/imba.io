tag example-app
	prop counter = 0

	def handle
		console.log 'handling event'
		imba.commit!
		imba.commit!
		imba.commit!
	
	def sync
		console.log 'handling event'
		# make sure that your views are updated
		await imba.commit!
		console.log 'views are updated'
		# commit will be called again after the event

	def render
		<self>
			<div> "Rendered {counter++} times"
			<button @click=handle> "commit"
			<button @click=sync> "await commit"

imba.mount <example-app>