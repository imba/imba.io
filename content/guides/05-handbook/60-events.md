# Events

# Listening to Events

We can use `<tag @event=expression>` to listen to DOM events and run `expression` when they’re triggered.

```imba
let counter = 0
<button ~[@click=(counter++)]~> "Increment to {counter + 1}"
```

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

## Common Modifiers

##### prevent
```imba
# ~preview
import 'util/styles'
const log = console.log.bind(console)
# ---
# calls preventDefault on event
imba.mount do
	<a href='https://google.com' @click~[.prevent]~=log('prevented')> 'Link'
```

##### stop
```imba
# ~preview
import 'util/styles'
const log = console.log.bind(console)
# ---
# .stop will call stopPropagation() on the event
imba.mount do <div @click=log('clicked div')>
	<button @click.stop=log('stopped')> 'stop'
	<button @click=log('bubble')> 'bubble'
```

##### self
```imba
# only trigger handler if event.target is the element itself
<section @click.self=console.log('clicked section')>
	<div> 'not triggering if click happens here'
```

##### once
```imba
# the click event will be triggered at most once
<div @click.once=console.log('click!')> 'Click me'
```

##### passive

```imba
# the click event will be triggered at most once
<div @scroll.passive=console.log('scrolled')> 'Scroll me'
```

##### capture

```imba
# use capture mode when adding the event listener
# i.e. an event targeting an inner element is handled here 
# before being handled by that element
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

## Key Modifiers

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

## System Key Modifiers

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

# Triggering Events

# Pointer Events

See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)

# Keyboard Events

# Mouse Events

# Custom Events

## Touch

## Resize

The [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) interface reports changes to the dimensions of an Element's content or border box. It has [decent browser support](https://caniuse.com/#feat=resizeobserver) and is very useful in a wide variety of usecases. ResizeObserver avoids infinite callback loops and cyclic dependencies that are often created when resizing via a callback function. It does this by only processing elements deeper in the DOM in subsequent frames.

| Properties  |  |
| --- | --- |
| `event.entry` | Returns the [ResizeObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry) |
| `event.rect` | A DOMRectReadOnly object containing the new size of the observed element when the callback is run. |

[Example](/examples/resize-event)

## Intersect

[IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) is a [well-supported](https://caniuse.com/#feat=intersectionobserver) API in modern browsers. It provides a way to asynchronously observe changes in the intersection of a target element with an ancestor element or with a top-level document's viewport. In Imba it is extremely easy to set up an intersection observer.

| Properties  |  |
| --- | --- |
| `event.entry` | Returns the [IntersectionObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry) |
| `event.ratio` | Returns the ratio of the intersectionRect to the boundingClientRect |
| `event.delta` | Difference in ratio since previous event |

> Explain intersecion ratio?

### Example

```imba
# ~preview
css body p:6
css .grid d:grid g:3
css .box d:grid gap:4 p:4 radius:2 bw:1 bc:black/5
css .field p:1 px:2 radius:2 bw:1 bc:gray4 c:gray8
css .box bg:white .teal:teal3 .blue:blue3

# ---
import {genres} from 'imdb'

tag Genre
    css @force p:4 bg:blue2 h:120px

	prop ratio = 0

    def intersected e
        ratio = e.ratio

	def render
		<self[opacity:{ratio}] @intersect(10)=intersected> <slot>

imba.mount do
	<div.box> for genre in genres
		<Genre> genre
```

##### intersect(n)
```imba
# n 0-1 adds single threshold at n visibility
<div @intersect(0)=handler> # On 0%
<div @intersect(0.5)=handler> # On 50%
<div @intersect(1)=handler> # On 100%

# n > 1 will add n thresholds - spread evenly
<div @intersect(2)=handler> # Trigger [0%,100%]
<div @intersect(3)=handler> # Trigger [0%,50%,100%]
<div @intersect(5)=handler> # Trigger [0%,25%,50%,75%,100%]
# ... and so forth
```

##### intersect.in
```imba
# Will only trigger when intersection ratio increases
<div @intersect.in=handler>
# Will only trigger when element is more than 50% visible
<div @intersect(0.5).in=handler>
```
> The `in` modifier tells the intersection event to only trigger whenever the visibility has *increased*.

##### intersect.out
```imba
# Will only trigger when element starts intersecting
<div @intersect.out=handler>
# Will trigger whenever any part of the div is hidden
<div @intersect(1).out=handler>
```
> The `in` modifier tells the intersection event to only trigger whenever the visibility has *decreased*.

## Selection
