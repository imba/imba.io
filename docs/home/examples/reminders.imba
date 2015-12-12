tag reminders < form

	def onsubmit event
		@list.append <li.reminder> @field.value
		@field.value = ''
		event.cancel

	def render
		<self>
			<input@field placeholder='Remind me...'>
			<ul@list>