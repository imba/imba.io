tag todos < form

	def setup
		@items = []

	def onsubmit event
		@items.push(title: @input.value)
		@input.value = ''
		event.cancel
		render

	def archive
		@items = @items.filter do |todo| !todo:done
		render

	def toggle e
		e.target.toggleFlag('done')

	def render
		<self>
			<input@input placeholder='What to do?'>
			<ul> for item in @items
				<li.todo :tap='toggle'> item:title
			<footer :tap='archive'>
				"You have {@items:length} todos"