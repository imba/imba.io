# Event Handling

We can use `<tag @event=expression>` to listen to DOM events and run `expression` when they’re triggered.

```imba
let counter = 0
<button ~[@click=(counter++)]~> "Increment to {counter + 1}"
```

# Listening to Events

It is important to understand how these event handlers are treated. Imba is created to maximize readability and remove clutter. If you set the value to something that looks like a regular method call, this call (and its arguments) will only be called when the event is actually triggered.

```imba
<div @click=console.log('hey')> 'Will log hey'
```

In the example above, the console.log will only be called when clicking the element. If you just supply a reference to some function, imba will call that handler, with the event as the only argument.

```imba
<div @click=console.log> 'Will log the event'
```

Inside of these lazy handlers you can also refer to the event itself as `e`.

```imba
let x = 0
<button @click=console.log(e.type,e.x,e.y)> "Click"
<button @mousemove=(x = e.x)> "Mouse at {x}"
```

Remember that the expression will be called as is, so you never need to bind functions to their context and/or arguments.

```imba
import {todos} from './data.imba'

const handler = console.log.bind(console)

# ---
<ul> for item,i in todos
	<li @click=handler(e.type,item,i)> item.title
```


# Event Modifiers

Inspired by vue.js, Imba also supports modifiers. More often than not, event handlers are simple functions that do some benign thing with the incoming event (stopPropagation, preventDefault etc), and then continues on with the actual logic. By using modifiers directly where we bind to an event, our handlers almost never need to deal with the event that triggered them. Modifiers are chained after the event name like:

```imba
<button @click~[.stop.cancel.once]~=handler> 'Button'
```

Imba comes with a bunch of predefined event modifiers that should cover most regular usecases.

##### prevent
```imba
# calls preventDefault on event
<button @click.prevent=handler>
```

##### stop
```imba
// .stop will call stopPropagation() on the event
<div @click=alert('click div')>
	<button @click.stop=console.log('button 1')> 'button'
	<button @click=console.log('button 2')> 'bubble through'
```

##### self
```imba
// only trigger handler if event.target is the element itself
<section @click.self=console.log('clicked section')>
	<div> 'not triggering if click happens here'
```

##### once
```imba
// the click event will be triggered at most once
<div @click.once=console.log('click!')> 'Click me'
```

##### passive

```imba
// the click event will be triggered at most once
<div @scroll.passive=console.log('scrolled')> 'Scroll me'
```

##### capture

```imba
// use capture mode when adding the event listener
// i.e. an event targeting an inner element is handled here 
// before being handled by that element
<div @click.capture=console.log('click')> 'Click me'
```

##### silence
```imba
var counter = 0
<section>
	<span> "Rendered {++counter} times"
	<div @click.silence=console.log('click')> "Silenced"
	<div @click=console.log('click')> "Not silenced"
```
By default, Imba will 'commit' after all handled events, so that any scheduled elements are told to re-render in case anything has changed. Even though Imba is blazing fast, there are some cases where you might want to suppress this behaviour.

# Key Modifiers

For keyboard events (keydown, keyup, keypress) there are also some very handy modifiers available.


##### All key modifiers
```imba
def handler e
	console.log 'event',e.type,e.key

<input.field placeholder='Text..'
	@keydown.enter=handler # pressed enter arrow
	@keydown.left=handler # pressed left arrow
	@keydown.right=handler # pressed right arrow
	@keydown.up=handler # pressed up arrow
	@keydown.down=handler # pressed down arrow
	@keydown.tab=handler # pressed tab
	@keydown.esc=handler # pressed escape
	@keydown.space=handler # pressed space
	@keydown.del=handler # pressed delete or backspace
>
```

# System Key Modifiers

You can use the following modifiers to trigger mouse or keyboard event listeners only when the corresponding modifier key is pressed:

##### ctrl
```imba
<button @click.prevent.ctrl=console.log('ctrl+click')> 'ctrl+click'
```
> On mac there is no way to detect a `control+click` event. Instead you will have to intercept the `contextmenu` event, which is triggered by `control+click` and right mouse.
```imba
<button @contextmenu.prevent.ctrl=console.log('ctrl+click')> 'ctrl+click'
```


##### alt
```imba
<button @click.alt=console.log('alt+click')> 'alt+click'
```

##### shift
```imba
<button @click.shift=console.log('shift+click')> 'shift+click'
```

##### meta
```imba
<button @click.meta=console.log('meta+click')> 'meta+click'
```
> Note: On Macintosh keyboards, meta is the command key (⌘). On Windows keyboards, meta is the Windows key (⊞)

---

System modifier keys are different from regular keys and when used with `@keyup` events, they have to be pressed when the event is emitted. In other words, `@keyup.ctrl` will only trigger if you release a key while holding down `ctrl`. It won’t trigger if you release the `ctrl` key alone.

## Examples

### Chaining modifiers

```imba
# the order of modifiers matters;
# always prevent default action, but only trigger myHandler if alt as pressed
<button @click.prevent.alt=myHandler>
```


```imba
let x = 0
let y = 0

<div.absolute.inset-0 @mousemove=(x = e.x, y = e.y)>
    <div> "mouse is at {x},{y}"
```

Event bindings are not required to have a handler, so if you wanted an area inside a clickable target to not trigger the event, you could simply stop it there.

```imba
<section @click=console.log('click')>
	<div> 'clickable'
	<div @click.stop> 'not clickable'
```

# Triggering Events

hello
