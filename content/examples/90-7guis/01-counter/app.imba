let count = 0

imba.mount do
	<div>
		<input type='number' bind=count>
		<button @click=(count++)> 'count'


### as a reusable component

tag app-counter
	prop count = 0

	<self>
		<input[count] type='number'>
		<button :click.{count++}> count

###

# https://github.com/eugenkiss/7guis/wiki#counter