tag example-app
	prop counter = 0

	def mount
		$interval = setInterval(render.bind(self),1000)

	def unmount
		clearInterval($interval)

	def render
		<self.clock> "Rendered {counter++} times"

imba.mount <example-app>