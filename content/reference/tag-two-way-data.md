# Two-way data binding

Also see Form Input Bindings.

### Deep two-way binding [preview]

```imba app.imba
import './controls'

let query = 'any'

tag App
	<self>
		<div>
			<search-field bind=query>
			"Search query is {query}"

imba.mount do <App>
```
```imba controls.imba
tag search-field
	<self[d:inline-block p:2]>
		"Search:"
		<input type='text' bind=data>
```