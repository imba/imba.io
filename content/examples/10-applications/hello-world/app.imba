var counter = 0

imba.mount do
	<div @click=(counter++)> "Clicked {counter} times!"