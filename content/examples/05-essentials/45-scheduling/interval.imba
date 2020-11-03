tag example-app
	counter = 0

	def mount
		#interval = setInterval(&,1000) do render!

	def unmount
		clearInterval(#interval)

	def render
		<self.clock> "Rendered {counter++} times"

imba.mount <example-app>