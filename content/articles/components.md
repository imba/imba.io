Sometimes you will want to define custom reusable components. Custom imba tags compiles to web components.

## Declaring

> Naming rules for custom components
> Render method is optional
> Declaring properties
> Declaring attributes

```imba
tag my-component
	def render
		<self>
			<div.one.two title='hello'> "Hello there"
```

## What is `<self>`?

## Advanced: Element References
```imba
tag app-example

	def submit
		$title
		console.log $title.value

	def render
		<self>
			<input$title type='text'>
			<button :click.submit> 'submit'

imba.mount <app-example>
```

## Advanced: Dynamic element types

```imba
let items = [
	type: 'todo'
	title: 'My task'
	---
	type: 'note'
	title: 'My note'
]

tag todo-item
	<self> "Todo: {data.title}"

tag note-item
	<self> "Note: {data.title}"

imba.mount do
	<ul> for item in items
		<li> <{item.type}-item data=item>

```