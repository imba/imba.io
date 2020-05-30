import { Todo } from './todo.imba'

tag App
	prop items = []

	css .done = text:line-through

	def add title
		items.push(new Todo title: title)
		$input.value = ''

	def toggle item
		item.done = !item.done

	def archive
		items = items.filter(do !$1.done)

	def render
		<self>
			<form @submit.prevent=add($input.value)>
				<input$input placeholder='What to do?'>
			<ul> for item in items
				<li.todo .done=item.done @click=toggle(item)> item.title
			<footer>
				"You have {items.length} todos"
				<button @click=archive> "Archive"

imba.mount <App>