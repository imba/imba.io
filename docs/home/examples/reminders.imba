tag reminders < form

	def test
		var hello
		var other = 10 + hello
		return other

	def onsubmit event
		@list.append <li.reminder> @field.value
		@field.value = ''
		event.cancel

	def render
		<self>
			<input@field placeholder='Remind me...'>
			<ul@list>