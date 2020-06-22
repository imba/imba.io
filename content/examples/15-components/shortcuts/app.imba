import { Todo } from './todo.imba'

tag todos-app
	prop items = []
	prop newTitle = ''

	def add event
		let todo = new Todo title: newTitle
		items.push(title: newTitle)
		newTitle = ''

	def toggle item
		item.done = !item.done

	def archive
		items = items.filter(do !$1.done)

	def render
		<self>
			<form @submit.prevent=add>
				<input bind=newTitle placeholder='What to do?'>
			<ul> for item in items
				<li.todo .done=item.done @click=toggle(item)> item.title
			<footer>
				"You have {items.length} todos"
				<button @click=archive> "Archive"

imba.mount <todos-app>