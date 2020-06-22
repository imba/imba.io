# https://github.com/eugenkiss/7guis/wiki#counter
tag app-counter
	prop count = 0

	<self>
		<input bind=count type='number'>
		<button @click.{count++}> count
