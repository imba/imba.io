# Elements


##### Creating elements
```imba
let element = <div.main> "Hello"
```

### Properties

```imba
<input type="text" value="hello">
```

```imba
var data = {name: "jane"}
<input type="text" value=data.name>
```

### Classes
Classes are set with a syntax inspired by css selectors:
```imba
<div.font-bold> "Bold text"
```
Multiple classes are chained together:
```imba
<div.font-bold.font-serif> "Bold & serif text"
```
If you want to set classes only when some expression is true you can use conditional classes:
```imba
var featured = yes
var archived = no
<div .font-bold=featured .hidden=archived> "Bold but not hidden"
```

To set dynamic classes you can use `{}` interpolation:
```imba
var state = 'done'
var marks = 'font-bold'
var color = 'blue'

<div.p-2 .{marks} .{state} .bg-{color}-200> "Bolded with bg-blue-200"
```

### Styling

```imba
<div.(font-weight:700)> "Bold text"
```

### Children

Indentation is significant in Imba, and elements follow the same principles. We never explicitly close our tags. Instead, tags are closed implicitly by indentation. So, to add children to an element you simply indent them below:

```imba
<div>
	<ul>
		<li> 'one'
		<li> 'two'
		<li> 'three'
```
When an element only has one child it can also be nested directly inside:
```imba
<div> <ul>
	<li.one> <span> 'one'
	<li.two> <span> 'two'
	<li.three> <span> 'three'
```

## Conditionals and Loops

Since tags are first-class citizens in the language, logic works here as in any other code:
```imba
var seen = true
<div>
	if seen
		<span> "Now you see me"
	else
		<span> "Nothing to see here"
```

If we have a dynamic list we can simply use a `for in` loop:

```imba
import {todos} from './data.imba'

# ---
<ul> for todo in todos
	<li.todo> <span.name> todo.title
```

Here's an example with more advanced logic:

```imba
import {todos} from './data.imba'

# ---
<div>
	for todo,i in todos
		# add a separator before every todo but the first one
		<hr> if i > 0 
		<div.todo .line-through=todo.done>
			<span.name> todo.title
			if !todo.done
				<button> 'finish'
```

> `for of` and `for own of` loops also supported for iteration