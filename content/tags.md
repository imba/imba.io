---
title:Rendering
multipage:true
---

# Basic Syntax

In Imba, DOM elements are a first-class part of the language. Imba does not use a virtual DOM, instead it compiles declarative tag trees into an extremely efficient [memoized dom](https://medium.com/free-code-camp/the-virtual-dom-is-slow-meet-the-memoized-dom-bb19f546cc52), which is orders of magnitute faster than virtual DOM approaches, yet conceptually simpler.

## Constructing Elements

```imba
let div = <div#main.note.sticky title='Welcome'> 'Hello'
```

The code above creates an actual HTMLDivElement. It will be helpful to understand what happens behind the scenes when creating an element using the literal syntax. Imba breaks up each part of the node, and applies them one after the other. The code above roughly compiles to:

```imba
let div = document.createElement('div') # create div
div.id = 'main' # set id
div.classList.add('note') # add .note
div.classList.add('sticky') # add .sticky
div.title = 'Welcome' # set title
div.textContent = 'Hello' # set textContent
```

## Setting Properties

### Classes

You can add classes to your elements by adding one or more identifiers preceded by `.`

```imba
# add note and editorial classes
<div.note.editorial> "Hello"
```

Set a class only when a certain condition is met can be done using `.class=condition`.

```imba
<div.note.editorial .resolved=data.isResolved> "Hello"
```

To add dynamic classes based on data use `{}` for interpolation inside class names:

```imba
let marks = 'rounded important'
let state = 'done'
let color = 'blue'
# ---
<div.item .{marks} .{state} .bg-{color}-200> "Hello"
```

These interpolated classes can also be toggled by a condition:

```imba
<div.item .theme-{user.theme}=app.loggedIn> "Hello"
```

Classes are set and updated in an optimised way which means that updating the raw `el.className` or `el.classList` directly will yield unexpected results. When you want to add and remove classes directly from the elements outside of rendering trees you need to use `el.flags` which works just like [Element.classList](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList).

```imba
# add example for el.flags here
```

### Properties

As you've already seen you can add properties to the elements just like you would in HTML. Beware that imba compiles to setting actual properties on the dom nodes instead of using setAttribute.

```imba
<div lang="en" title=data.title> "Hello"
```

### Styles

Read the Styling section for in-depth documentation about styling, both via selectors and inline on elements.

```imba
<div[color:red bg:blue padding:8px]> "Hello"
```

Just like classes, styles can be conditionally applied

```imba
<div[color:red bg:blue] [display:none]=app.loggedIn> "Hello"
```

## Rendering Children

Indentation is significant in Imba, and tags follow the same principles. We never explicitly close our tags. Instead, tags are closed implicitly by indentation. So, to add children to an element you simply indent them below:

```imba
<div> <ul>
	<li> <span> 'one'
	<li> <span> 'two'
	<li> <span> 'three'
```

Tags can also be included inside string interpolations, so that templates like this:

```imba
<div>
    "This is "
    <b> "very"
    " important"
```

Can be written like on a single line

```imba
<div> "This is {<b> "very"} important"
```

Also, if you explicitly close your elements using `/>` at the end, you can add multiple elements after one another without problem:

```imba
<label> <input type='checkbox'/> 'Dark Mode'
```

## Conditionals & Loops

There isn't really a difference between templating syntax and other code in Imba. Tag trees are just code, so logic and control flow statements work as you would expect. To render dynamic lists of items you simply write a `for` loop where you want the children to be:

```imba
<div>
    if items
        <h1> "List of items:"
        <ul> for item in items
            <li> <span> item
    else
        <span> "No items found"
```

You can use break, continue and other control flow concepts as well:

```imba
# ~preview=xl
import {movies} from 'imdb'

css .heading c:blue7 fs:xs fw:bold p:2 bc:gray3 bbw:1 pos:sticky t:0 bg:white
css .item mx:2 d:flex px:2 py:3 bc:gray2 bbw:1 bg.hover:gray1
css .title px:1 t:truncate
css .number rd:3 px:2 bg:blue2 mr:1 fs:xs c:blue7 d:grid pc:center

# ---
imba.mount do <div.list> for movie,i in movies
    if i % 10 == 0
        # Add a heading for every 10th item
        <div.heading> "{i + 1} to {i + 10}"
    <div.item>
        <span.number> i + 1
        <span.title> movie.title
    # break out of the loop early
    break if movie.title == 'The Usual Suspects'
```

## Mounting Elements

The fact that tag literals generate real dom nodes means that we can add/remove/modify the dom in an imperative way. In theory.

##### [preview=lg]

```imba
# ~preview=xl
import 'util/styles'

# ---
let array = ["First","Second"]

let view = <main>
    <button @click=array.push('More')> 'Add'
    <ul.list> for item in array
        <li> item

# view is a real native DOM element
document.body.appendChild view
```

Even tough we rendered a dynamic list of items, it won't update if new items are added to the array or if members of the array change. Clicking the button will actually add items, but our view is clearly not keeping up. What to do?

### imba.mount

To make the tag tree update when our data changes, we need to add pass the tree to `imba.mount`.

##### [preview=lg]

```imba
import 'util/styles'

# ---
let array = ["First","Second"]

imba.mount do
    <main>
        <button @click=array.push('More')> 'Add'
        <ul.list> for item in array
            <li> item
```

Now you will see that when you click the button, our view instantly updates to reflect the new state. How does this happen without a virtual dom? The array is not being tracked in a special way (it is just a plain array), and we are only dealing with real dom elements, which are only changed and updated when there is real need for it. Imba uses a technique we call `memoized dom`, and you can read more about how it works [here](https://medium.com/free-code-camp/the-virtual-dom-is-slow-meet-the-memoized-dom-bb19f546cc52). Here is a more advanced example with more dynamic data and even dynamic inline styles:

##### [preview=lg]

```imba
# ~preview=xl
import 'util/styles'

css div pos:absolute d:block inset:0 p:4
css mark pos:absolute
css li d:inline-block px:1 m:1 rd:2 fs:xs bg:gray1 @hover:blue2

# ---
let x = 20, y = 20, title = "Hey"

imba.mount do
    <main @mousemove=(x=e.x,y=e.y)>
        <input bind=title>
        <label> "Mouse is at {x} {y}"
        <mark[x:{x} y:{y} rotate:{x / 360}]> "Item"
        <ul> for nr in [0 ... y]
            <li> nr % 12 and nr or title
```

By default Imba will **render your whole application whenever anything _may_ have changed**. Imba isn't tracking anything. This sounds insane right? Isn't there a reason for all the incredibly complex state management libraries and patterns that track updates and wraps your data in proxies and all that? As long as you have mounted your root element using `imba.mount` you usually don't need to think more about it.

### imba.commit

The default approach of Imba is to re-render the mounted application after every handled DOM event. If a handler is asynchronous (using await or returning a promise), Imba will also re-render after the promise is finished. Practically all state changes in applications happen as a result of some user interaction.

In the few occasions where you need to manually make sure views are updated, you should call `imba.commit`. It schedules an update for the next animation frame, and things will only be rerendered once even if you call `imba.commit` a thousand times. It returns a promise that resolves after the actual updates are completed, which is practical when you need to ensure that the view is in sync before doing something.

##### commit from websocket

```imba
socket.addEventListener('message',imba.commit)
```

Calling `imba.commit` after every message from socket will ensure that your views are up-to-date when your state changes as a result of some socket message.

##### commit after fetching data

```imba
def load
    let res = await window.fetch("/items")
    state.items = await res.json!
    imba.commit!
```

## Dynamic Element Type [advanced]

The first part of your tag literal should be the node name. So, to create a section you write `<section>`, for a list item you write `<li>` and so forth. You can use `{}` interpolation in the node name to spawn custom tags:

```imba
# ~preview
import 'util/styles'
# ---
let data = {type: 'button', label: 'Hello'}
imba.mount do
    <div.group>
        <section> "A section"
        <{data.type}> data.label
```

If you create an element without a node name it will always be created as a `div`.

## Fragments [advanced]

Fragments allow grouping elements together in a parent tag, without actually adding the parent tag to the DOM. Fragments can be created using empty tag literals `<>`.

# Custom Components

## Defining Components

Components are reusable elements with functionality and children attached to them. Components are _just like regular classes_ and uses all the same syntax to declare properties, methods, getters and setters. To create a component, use the keyword `tag` followed by a component name.

### Global Components

```imba
tag app-component
    # add methods, properties, ...
```

Components with lowercased names containing at least two words separated by a dash are compiled directly to global [native Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components). As long as you have imported the component _somewhere in your code_, you can create instances of the component anywhere.

### Local Components

```imba
export tag App
    # add methods, properties, ...
```

Components whose name begins with an uppercase letter are considered local components. They act just like web components, but are not registered globally, and must be exported + imported from other files to be used in your project. Very useful when you want to define custom components that are local to a subsystem of your application.

```imba app.imba
import {Sidebar} from './sidebar'
import {Header} from './header'

tag App
    <self>
        <Header>
        <Sidebar>
        <main> "Application"
```

```imba sidebar.imba
export tag Sidebar
    <self[d:inline-block p:2]> "Sidebar here"
```

```imba header.imba
export tag Header
    <self[d:inline-block p:2]> "Header"
```

## Self & Rendering [wip]

## Nesting Components

You may have multiple tags in one document, and render them within the other tags in the document.

```imba
tag app-header
	def render
		<self>
			<h1> "Hello World!"
tag app-root
	def render
		<self>
			<app-header>
```

## Using Slots

Sometimes you want to allow taking in elements from the outside and render them somewhere inside the tree of your component. `<slot>` is a placeholder for the content being passed in from the outside.

### Default Slot

```imba
tag app-option
    <self>
        <input type="checkbox">
        <label> <slot>

imba.mount do <app-option>
    <b> "Option name"
    <span> "Description for this option"
```

### Placeholder Content [preview=md]

Anything inside the `<slot>` will be shown if no content is supplied from outside.

```imba
import 'util/styles'
css body d:flex
css app-option d:hflex a:center
css app-example d:vflex

# ---
tag app-option
    <self>
        <input type="checkbox">
        <label> <slot> "Default label"

tag app-example
    <self>
        <app-option>
        <app-option> <span> "Custom label"

imba.mount <app-example>
```

### Named Slots [preview=md]

You can also add named slots using `<slot name=...>` and render into them using `<el for=slotname>` in the outer rendering.

```imba
# ~preview
import 'util/styles'
css body d:flex

css app-panel d:hflex
	aside p:1 bg:gray3
	main p:1 fs:md fl:1

# ---
tag app-panel
    <self.panel>
        <aside.left> <slot name="sidebar"> "Sidebar"
        <main> <slot> <p> "Default Body"
        <aside.right> <slot name="Detail"> "Right"

imba.mount do <app-panel>
    <div slot="sidebar"> "Stuff!"
    <div> "Something in main slot"
    <div> "More in main slot"
```

## Named Elements [preview=md]

It can be useful to keep references to certain child elements inside a component. This can be done using `<node$reference>` syntax.

```imba
import 'util/styles'

# ---
tag app-panel
    css .name bg:blue1
    <self.group>
        <button @click=($name.value += 'Hi')> "Write"
        <input$name type='text'>
# ---

imba.mount <app-panel>
```

In the code above, `$name` is available everywhere inside `app-panel` component, but also from outside the app-panel as a property of the component.

### Quick tip [tip]

Elements with a reference automatically get a flag with the same name as the reference.

## Declaring Attributes [wip]

# Handling Events

## Listening to events

We can use `<tag @event=expression>` to listen to DOM events and run `expression` when they’re triggered.

```imba
let counter = 0
<button ~[@click=(counter++)]~> "Increment to {counter + 1}"
```

It is important to understand how these event handlers are treated. Imba is created to maximize readability and remove clutter. If you set the value to something that looks like a regular method call, this call (and its arguments) will only be called when the event is actually triggered.

```imba
<div @click=console.log('hey')> 'Will log hey'
```

In the example above, the console.log will only be called when clicking the element. If you just supply a reference to some function, Imba will call that handler, with the event as the only argument.

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

## Triggering events

### Trigger Event from method

To trigger a custom event you call `element.emit(name,data = {})`

To trigger a custom event you call `emit` on the element you want to trigger an event from.

```imba
# [preview=md]
import 'util/styles'
# ---
tag App
    def lateTrigger
        setTimeout(&,500) do
            emit('waited',some: 'data')

    <self @waited=console.log('done',e.detail)>
        <button @click=lateTrigger> 'click me'

imba.mount <App>
```

### Trigger event via event listener [preview]

You can use the `emit-eventname` modifier to trigger a custom event directly from an event handler.

```imba
import 'util/styles'
# ---
tag Item
    <self>
        # wait 500ms after click - then emit custom waited event
        <button @click.wait(500).emit-waited([1,2,3])> 'click me'

tag App
    <self>
        # listen to custom waited event
        <Item @waited=console.log('done',e.detail)>

imba.mount <App>
```

## Touch Event [linked]

To make it easier and more fun to work with touches, Imba includes a custom `touch` event that combines `pointerdown` -> `pointermove` -> `pointerup/pointercancel` in one convenient handler, with modifiers for commonly needed functionality.

```imba
# [preview=lg]
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	<self @touch=(x=e.x,y=e.y)> "x={x} y={y}"
# ---
imba.mount do <Example.rect>
```

The `event` emitted by this handler is not an event, but a `Touch` object, that remains the same across the whole touch. 

| Properties  |  |
| --- | --- |
| `e.event` | The last/current event in this touch |
| `e.target` | The element that initiated this touch |
| `e.events` | Array of all the events that are part of this touch |
| `e.x` | Normalized x coordinate for the pointer |
| `e.y` | Normalized y coordinate for the pointer |
| `e.elapsed` | The time elapsed since pointerdown started (in milliseconds) |


You can add arbitrary properties to the touch object if you need to keep track of things across the many events that will be triggered during this touch.

### Thresholds

##### moved ( threshold = 4px ) [preview=lg]

```imba
# [preview=lg]
import 'util/styles'
css .rect pos:absolute inset:0

# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	# won't trigger until moved 30px from start
	<self @touch.moved(30)=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```

This guard will break the chain unless the touch has moved more than `threshold`. Once this threshold has been reached, all subsequent updates of touch will pass through. The element will also activate the `@move` pseudostate during touch - after threshold is reached.



##### moved-up ( threshold = 4px ) [preview=lg]
```imba
# [preview=sm]
import 'util/styles'
css .rect pos:absolute inset:0
# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	<self @touch.moved-up=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```
##### moved-down ( threshold = 4px )
```imba
# [preview=sm]
import 'util/styles'
css .rect pos:absolute inset:0
# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	<self @touch.moved-down=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```

##### moved-left ( threshold = 4px )
```imba
# [preview=sm]
import 'util/styles'
css .rect pos:absolute inset:0
# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	<self @touch.moved-left=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```
##### moved-right ( threshold = 4px )
```imba
# [preview=sm]
import 'util/styles'
css .rect pos:absolute inset:0
# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	<self @touch.moved-right=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```

##### moved-x ( threshold = 4px )
```imba
# [preview=sm]
import 'util/styles'
css .rect pos:absolute inset:0
# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	<self @touch.moved-x=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```
##### moved-y ( threshold = 4px )
```imba
# [preview=sm]
import 'util/styles'
css .rect pos:absolute inset:0
# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	<self @touch.moved-y=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```

### Syncing

A convenient touch modifier that takes care of updating the x,y values of some data during touch. When touch starts sync will remember the initial x,y values and only add/subtract based on movement of the touch.

##### sync ( data )

Sync will update the x and y properties of whatever object you decide to supply as an argument.

```imba
# [preview=md]
import 'util/styles'
css .rect pos:absolute inset:0
# ---
tag Draggable
	pos = {x:0,y:0}
	<self[w:80px x:{pos.x} y:{pos.y}] @touch.sync(pos)>
# ---
imba.mount do <Draggable.rect>
```

```imba
# [preview=md]
import 'util/styles'

# ---
const pos = {x:0,y:0}
# mounting two draggables - tracing the same one
imba.mount do <>
	<div[w:60px x:{pos.x} y:{pos.y}].rect @touch.sync(pos)> 'drag'
	<div[w:60px x:{pos.y} y:{pos.x}].rect> 'flipped'
```


##### sync ( data, alias-x, alias-y )
```imba
# [preview=md]
import 'util/styles'

# ---
const data = {a:0,b:0}
# mounting two draggables - tracing the same one
imba.mount do <>
	<div[w:80px x:{data.a} top:{data.b}px].rect @touch.sync(data,'a','b')> 'drag'
	<label> "a:{data.a} b:{data.b}"
```
You can also include the property names you want to sync x and y to/from.


### Interpolating

A very common need for touches is to convert the coordinates of the touch to some other frame of reference. When dragging you might want to make x,y relative to the container. For a custom slider you might want to convert the coordinates from pixels to relative offset of the slider track. There are loads of other scenarios where you'd want to convert the coordinates to some arbitrary scale and offset. This can easily be achieved with fitting modifiers.

##### fit ( box, snap = 1 )

```imba
# [preview=lg]
import 'util/styles'
css .rect w:80vw
# ---
tag Unfitted
	<self @touch=(x=e.x)> "window.x {x}"
tag Fitted
	<self @touch.fit(self)=(x=e.x)> "box.x {x}"
tag Snapped
	<self @touch.fit(self,2)=(x=e.x)> "box.x {x}"
# ---
imba.mount do <>
	<Unfitted.rect>
	<Fitted.rect>
	<Snapped.rect>
```
The first argument of fit is the box you want to fit to. If box is a string it will be treated as a selector and try to look up an element matching the selector

##### fit ( box, start, end, snap = 1)

```imba
# [preview=lg]
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	# convert x,y to go from 0 in top left corner to 100 in bottom right
	<self @touch.fit(self,0,100)=(x=e.x,y=e.y)> "x:{x} y:{y}"
# ---
imba.mount <Example.rect>
```
By passing `start` and `end` values, you can very easily convert the coordinate space of the touch. Imba will use linear interpolation to convert x,y relative to the box, to the interpolated values between start and end.
You can use negative values on `start` and `end` as well.
```imba
# [preview=lg]
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	# convert x,y to go from -50 to +50 with 0.1 increments
	<self @touch.fit(self,-50,50,0.1)=(x=e.x,y=e.y)> "x:{x} y:{y}"
# ---
imba.mount <Example.rect>
```


You can also use percentages in start and end to reference the width and height of the box we're mapping to.
```imba
# [preview=lg]
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	# this will essentially flip the origin from top left to bottom right
	<self @touch.fit(self,100%,0)=(x=e.x,y=e.y)> "x:{x} y:{y}"
# ---
imba.mount <Example.rect>
```
You can also use arrays to fit the x and y axis to different values.
```imba
# [preview=lg]
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	# will flip and center the y axis
	<self @touch.fit(self,[0,50%],[100%,-50%])=(x=e.x,y=e.y)> "x:{x} y:{y}"
# ---
imba.mount <Example.rect>
```

### Pinning

### Examples

##### Custom slider
```imba
# [preview=lg]
import 'util/styles'

css body > * w:50vw m:2 h:4 bg:blue3 pos:relative rd:sm
# css .track h:4 w:100% bg:blue3 pos:relative rd:sm
css .thumb h:4 w:2 bg:blue7 d:block pos:absolute x:-50% t:50% y:-50% rd:sm
css .thumb b x:-50% l:50% b:100% w:5 ta:center pos:absolute d:block fs:xs c:gray6

# ---
tag Slider
	prop min = -50
	prop max = 50
	prop step = 1
	prop value = 0

	<self @touch.fit(min,max,step)=(value = e.x)>
		<.thumb[l:{100 * (value - min) / (max - min)}%]> <b> value

imba.mount do <>
	<Slider min=0 max=1 step=0.25>
	<Slider min=-100 max=100 step=1>
	<Slider min=10 max=-10 step=0.5>
```

##### Pane with divider
```imba
# [preview=md]
import 'util/styles'

# ---
tag Panel
	prop split = 70

	<self[d:flex pos:absolute inset:0]>
		<div[bg:teal2 flex-basis:{split}%]>
		<div[fls:0 w:2 bg:teal3 @touch:teal5]
			@touch.pin.fit(self,0,100,2)=(split=e.x)>
		<div[bg:teal1 flex:1]>

imba.mount do <Panel>
```

##### Simple draggable [app]
```imba
# [preview=xl]
import 'util/styles'
# css body bg:gray1
# ---
tag drag-me
	css d:block pos:relative p:3 m:1
		bg:white bxs:sm rd:sm cursor:default
		@touch scale:1.02
		@move scale:1.05 rotate:2deg zi:2 bxs:lg

	def build
		x = y = 0

	def render
		<self[x:{x} y:{y}] @touch.moved.sync(self)> 'drag me'

imba.mount do <div.grid>
	<drag-me>
	<drag-me>
	<drag-me>
```

##### Paint [app]

```imba
# [preview=xl]
# ---
const dpr = window.devicePixelRatio

tag app-paint
	prop size = 500
	
	def draw e
		let path = e.$path ||= new Path2D
		path.lineTo(e.x * dpr,e.y * dpr)
		$canvas.getContext('2d').stroke(path)

	def render
		<self[d:block overflow:hidden bg:blue1]>
			<canvas$canvas[size:{size}px]
				width=size*dpr height=size*dpr @touch.fit(self)=draw>

imba.mount <app-paint>
```

## Intersection Event [linked]

[IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) is a [well-supported](https://caniuse.com/#feat=intersectionobserver) API in modern browsers. It provides a way to asynchronously observe changes in the intersection of a target element with an ancestor element or with a top-level document's viewport. Imba adds a simplified abstraction on top of this via the custom `intersection` event.

| Properties  |  |
| --- | --- |
| `event.entry` | Returns the [IntersectionObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry) |
| `event.ratio` | Returns the ratio of the intersectionRect to the boundingClientRect |
| `event.delta` | Difference in ratio since previous event |

### Examples

```imba
# [preview=xl]
css body p:6
css .grid d:grid g:3
css .box d:grid gap:4 p:4 radius:2 bw:1 bc:black/5
css .field p:1 px:2 radius:2 bw:1 bc:gray4 c:gray8
css .box bg:white .teal:teal3 .blue:blue3

# ---
import {genres} from 'imdb'

tag Genre
	ratio = 0

	def intersected e
		ratio = e.ratio

	<self[o:{ratio}] @intersect(10)=intersected> <slot>

imba.mount do
	<div.box> for genre in genres
		<Genre[p:4 bg:blue2 h:120px]> genre
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

## Resize Event [wip]

## Selection Event [wip]

# Event Modifiers

Inspired by vue.js, Imba supports event modifiers. More often than not, event handlers are simple functions that do some benign thing with the incoming event (stopPropagation, preventDefault etc), and then continues on with the actual logic. By using modifiers directly where we bind to an event, our handlers can be pure logic without any knowledge of the event that triggered them.

## Core Modifiers

#### prevent [event-modifier] [snippet]

Tells the browser that the default action should not be taken. The event will still continue to propagate up the tree. See [Event.preventDefault()](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
```imba
# [preview=sm]
import 'util/styles'

imba.mount do
	# ---
	<a href='https://google.com' @click.prevent.log('prevented')> 'Google.com'
```


#### stop [event-modifier] [snippet]

Stops the event from propagating up the tree. Event listeners for the same event on nodes further up the tree will not be triggered. See [Event.stopPropagation()](https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation)

```imba
# [preview=sm]
import 'util/styles'

imba.mount do
	# ---
	<div.group @click.log('clicked div')>
		<button @click.stop.log('stopped')> 'click.stop'
		<button @click.log('bubble')> 'click'
```

#### once [event-modifier] [snippet]

Indicates that the listeners should be invoked at most once. The listener will automatically be removed when invoked.

```imba
# [preview=sm]
import 'util/styles'

imba.mount do
	# ---
	<button @click.once.log('once!')> 'Click me'
```

Remember that modifiers can be chained, and that the order of chaining matters. If you have conditional modifiers etc before the `once` - the listener will only be removed if the `once` modifier is reached.

```imba
# [preview=md]
import 'util/styles'

imba.mount do <fieldset>
	<legend> "Try to click buttons without holding shift first"
	<div[d:contents]>
		# ---
		<button @click.shift.once.log('yes!')> "shift-once"
		<button @click.once.shift.log('yes!')> "once-shift"
```

You can click the first button as many times you want without shift, but once you've clicked it while holding down shift it the handler will be invoked, and then removed. On the second button the `once` modifier appears before shift, so the listener will be removed after the first click, no matter if shift was pressed or not.


#### capture [event-modifier] [snippet]

Indicating that events of this type should be dispatched to the registered listener before being dispatched to tags deeper in the DOM tree. 

```imba
# [preview=sm]
import 'util/styles'

imba.mount do <fieldset>
	# ---
	<div @click.capture.stop.log('captured!')>
		<button @click.log('button')> 'Click me'
```
When clicking the button you will see that the click listener on the parent div will actually be triggered first.

#### passive [event-modifier] [snippet]

```imba
# [preview=md]
import 'util/styles'

imba.mount do
	# ---
	<main[overflow:scroll] @scroll.passive.log('scrolled')>
		<article> "One"
		<article> "Two"
		<article> "Three"
```

#### silence [event-modifier] [snippet]

By default, Imba will re-render all scheduled tags after any *handled* event. So, Imba won't re-render your application if you click an element that has no attached handlers, but if you've added a `@click` listener somewhere in the chain of elements, `imba.commit` will automatically be called after the event has been handled. 

```imba
# [preview=md]
import 'util/styles'

# ---
let counter = 0
imba.mount do <section>
	<div.group>
		<button @click.silence.log('silenced')> "Silenced"
		<button @click.log('clicked')> "Not silenced"
	<label> "Rendered {++counter} times"
```

This is usually what you want, but it is useful to be able to override this, especially when dealing with `@scroll` and other events that might fire rapidly.

```imba
# [preview=md]
import 'util/styles'

# ---
tag Filter
	counter = 0
	<self>
		<div> "Filter rendered {counter++} times"
		<input value="Default" @selection.log('!')>
		<input value="Silent" @selection.silence.log('!')>

tag App
	counter = 0
	<self[ta:center]>
		<b> "App rendered {counter++} times"
		<Filter>

imba.mount <App>
```
If you try to select the "Default" text you will see that both the `App` and the `Filter` elements re-render. This happens because `App` is mounted via `imba.mount` which automatically schedules the element to render after events, and the Filter is rendered when `App` is rendered since it is a descendant of `App`. Now if you select text in the "Silent" input, it too has an event handler for the same event, but we've added a `.silence` modifier. This prevents the handler from automatically re-rendering scheduled elements after the event.



## Utility Modifiers

#### log ( ...params ) [event-modifier] [snippet]

Basic modifier that simply logs to the console. Mostly useful for testing and development.

```imba
# [preview=sm]
import 'util/styles'

# log to the console
imba.mount do
	# ---
	<button @click.log('logged!')> 'test'
```

#### wait ( duration = 250ms ) [event-modifier] [snippet]

The `wait` modifier delays the execution of subsequent modifiers and callback. It defaults to wait for 250ms, which can be overridden by passing a number as the first/only argument.

```imba
# [preview=sm]
import 'util/styles'

# ---
# delay subsequent modifiers by duration
imba.mount do <div.group>
	<button @click.wait.log('!')> 'wait'
	<button @click.wait(100).log('!')> 'wait 100ms'
	<button @click.log('!').wait(500).log('!!')> 'waith 500ms'
```

In isolation the `wait` modifier might not seem very useful, but in combination with throttling and chained listeners it becomes quite powerful.

#### throttle ( ms ) [event-modifier] [snippet]

```imba
# [preview=sm]
import 'util/styles'

# ---
# disable handler for duration after triggered
imba.mount do <fieldset>
	<button @click.throttle(1000).log('clicked')> 'click me'
	<div> "Not clickable within 1 second of previous invocation."
```

#### emit-_name_ ( detail = {} ) [event-modifier] [snippet]

```imba
# [preview=sm]
import 'util/styles'

# ---
imba.mount do
	<div.group @select=console.log(e.type,e.detail)>
		<button @click.emit-select> 'emit'
		<button @click.emit-select(a:1,b:2)> 'with data'
```

#### flag-_name_ ( target ) [event-modifier] [snippet]

```imba
# [preview=sm]
import 'util/styles'

# ---
# Add flag while event is being handled
imba.mount do
	<div.group>
		<button @click.flag-busy> 'flag self'
		<button @click.flag-busy('div').wait(1000)> 'flag div'
# Optionally supply a selector / element to flag
```


## Guard Modifiers

#### self [event-modifier] [snippet]

```imba
# [preview=sm]
import 'util/styles'
# ---
# only trigger handler if event.target is the element itself
imba.mount do
	<button @click.self.log('clicked self')>
		"Button"
		<b> "Nested"
```

#### sel ( selector ) [event-modifier] [snippet]

```imba
# [preview=sm]
import 'util/styles'

# ---
# only trigger if event.target.closest(selector) is true
imba.mount do <div.group>
	<button @click.log('!')> 'Button'
	<button @click.sel('.pri').log('!!')> 'Button'
	<button.pri @click.sel('.pri').log('!!!')> 'Button'
```

#### if ( expr ) [event-modifier] [snippet]

```imba
# [preview=sm]
import 'util/styles'
# ---
let age = 20
# break chain unless expr is truthy
imba.mount do <div.group>
	<input type='number' bind=age>
	<button @click.if(age > 20).log('drink')> 'drink'
	<button @click.if(age > 16).log('drive')> 'drive'
```

#### keys [snippet]

```imba
# [preview=sm]
import 'util/styles'

# ---
imba.mount do
	<header> <input placeholder='Text..'
		@keydown.enter.log('pressed enter')
		@keydown.left.log('pressed left')
		@keydown.right.log('pressed right')
		@keydown.up.log('pressed up')
		@keydown.down.log('pressed down')
		@keydown.tab.log('pressed tab')
		@keydown.esc.log('pressed esc')
		@keydown.space.log('pressed space')
		@keydown.del.log('pressed del')
	>
```

## System Key Modifiers

System modifier keys are different from regular keys and when used with @keyup events, they have to be pressed when the event is emitted. In other words, @keyup.ctrl will only trigger if you release a key while holding down ctrl. It won’t trigger if you release the ctrl key alone. You can use the following modifiers to trigger event listeners only when the corresponding modifier key is pressed:

#### ctrl [event-modifier] [snippet]

```imba
# [preview=sm]
import 'util/styles'

# ---
# break chain unless ctrl key is pressed
imba.mount do <div.group>
	<button @click.ctrl.log('ctrl+click')> 'ctrl+click'
	# On mac there is no way to detect a `control+click` event.
	# Instead you will have to intercept the `contextmenu` event,
	# which is triggered by `control+click` and right mouse.
	<button @contextmenu.prevent.ctrl.log('ctrlish+click')> 'ctrlish+click'
```

#### alt [event-modifier] [snippet]

```imba
# [preview=sm]
import 'util/styles'

# ---
# break chain unless alt key is pressed
imba.mount do
	<button @click.alt.log('alt+click')> 'alt+click'
```

#### shift [event-modifier] [snippet]

```imba
# [preview=sm]
import 'util/styles'

# ---
# break chain unless shift key is pressed
imba.mount do
	<button @click.shift.log('shift+click')> 'shift+click'
```

#### meta [event-modifier] [snippet]

```imba
# [preview=sm]
import 'util/styles'

# ---
# break chain unless meta key is pressed
# On mac keyboards, meta is the command key (⌘).
# On windows keyboards, meta is the Windows key (⊞)
imba.mount do <button @click.meta.log('meta+click')> 'meta+click'
```

## Pointer Modifiers

Modifiers available for all pointer events – pointerover, pointerenter, pointerdown, pointermove, pointerup, pointercancel, pointerout & pointerleave.

#### mouse [event-modifier] [pointer-modifier] [snippet]

```imba
# [preview=sm]
import 'util/styles'

# ---
imba.mount do
	<button @pointerdown.mouse.log('only mouse!')> 'Mouse Only'
```

#### pen [event-modifier] [pointer-modifier] [snippet]

```imba
# [preview=sm]
import 'util/styles'

# ---
imba.mount do
	<button @pointerdown.pen.log('only pen!')> 'Pen Only'
```

#### touch [event-modifier] [pointer-modifier] [snippet]

```imba
# [preview=sm]
import 'util/styles'

# ---
imba.mount do
	<button @pointerdown.touch.log('only touch!')> 'Touch Only'
```

#### pressure ( threshold = 0.5 ) [event-modifier] [pointer-modifier] [snippet]

```imba
# [preview=sm]
import 'util/styles'

# ---
imba.mount do
	<button @pointerdown.pressure.log('pressured?')> 'Button'
```

## Touch Modifiers

The following modifiers are available for the special `touch` event. More in depth examples of these modifiers can be seen in the [Touch](/docs/events/touch) docs.

#### moved ( threshold = 4px ) [event-modifier] [touch-modifier] [snippet]

```imba
# [preview=lg]
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	# won't trigger until moved 30px from start
	<self @touch.moved(30)=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```

Will break the chain until the touch has moved more than `threshold`. The element will also activate the `@move` pseudostate during touch - after threshold is reached.

#### moved-_direction_ ( threshold = 4px ) [event-modifier] [touch-modifier] [snippet]

```imba
# [preview=lg]
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	<self @touch.moved-up=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
```

Direction can be `up`, `down`, `left`, `right`, `x`, and `y`

#### sync ( data, xname = 'x', yname = 'y' ) [event-modifier] [touch-modifier] [snippet]

```imba
# [preview=lg]
import 'util/styles'

# ---
tag Draggable
	prop pos = {x:0,y:0}
	<self[w:80px x:{pos.x} y:{pos.y}].rect @touch.sync(pos)>
# ---
imba.mount do <Draggable>
```

A convenient touch modifier that takes care of updating the x,y values of some data during touch. When touch starts sync will remember the initial x,y values and only add/subtract based on movement of the touch.

## Resize Modifiers [wip]

## Intersection Modifiers [wip]

#### in [event-modifier] [intersection-modifier] [snippet]

```imba
<div @intersect.in=handler>
```

Break unless intersection ratio has increased.

#### out [event-modifier] [intersection-modifier] [snippet]

```imba
<div @intersect.out=handler>
```

Break unless intersection ratio has decreased.


# State Management [wip]

# Form Input Bindings

##### text [preview=md]

```imba
# ~preview=md
import 'util/styles'

# ---
let message = "Hello"

imba.mount do <section>
	<input type='text' bind=message>
	<label> "Message is {message}"
```

##### textarea [preview=md]

```imba
# ~preview=md
import 'util/styles'

# ---
let tweet = ''

imba.mount do <section>
	<textarea bind=tweet placeholder="What's on your mind...">
	<label> "Written {tweet.length} characters"
```

##### range [preview=md]

```imba
# ~preview=md
import 'util/styles'

# ---
let point = {r:0, x:0}

imba.mount do <section[gap:2]>
    <input type='range' bind=point.x>
    <input type='range' bind=point.r>
    <label[js:center w:40px rotate:{point.r}deg x:{point.x}]> "{point.x},{point.r}"
```

##### number [preview=md]

```imba
# ~preview
import 'util/styles'

# ---
let a=1, b=2

imba.mount do <div.group>
    <input type='number' min=0 max=100 bind=a/> " + "
    <input type='number' min=0 max=100 bind=b/> " = "
    <samp> "{a + b}"
```

##### checkbox [preview=md]

```imba
# ~preview
import 'util/styles'
# ---
let bool=no

imba.mount do <section>
    <label>
        <input[mr:1] type='checkbox' bind=bool />
        <span> "Enabled: {bool}"
```

##### checkbox with array [preview=md]

```imba
# ~preview
import {genres} from 'imdb'
import 'util/styles'

css div d:flex flf:row wrap pi:center jc:flex-start

# ---
let options = ['React','Vue','Imba','Svelte','Ember']
let interests = []

imba.mount do <section>
    <div> for option in options
        <label[mr:2]>
            <input type='checkbox' bind=interests value=option/>
            <span[pl:1]> option
    <label> "Interested in {interests.join(', ')}"
```

##### radio

```imba
# ~preview
import {genres} from 'imdb'
import 'util/styles'

css div d:flex flf:row wrap pi:center jc:flex-start

# ---
let options = ['React','Vue','Imba','Svelte','Ember']
let interest = 'Imba'

imba.mount do <section>
    <div> for option in options
        <label[mr:2]>
            <input type='radio' bind=interest value=option/>
            <span[pl:1]> option
    <label> "Interested in {interest}"
```

##### select

```imba
# ~preview=md
import {genres} from 'imdb'
import 'util/styles'

css div d:flex flf:row wrap pi:center jc:flex-start

# ---
let options = ['React','Vue','Imba','Svelte','Ember']
let focus = 'Imba'

imba.mount do <section>
    <select bind=focus> for item in options
        <option value=item> item
    <label> "Focused on {focus}"
```

##### multiselect

```imba
# ~preview=lg
import {genres} from 'imdb'
import 'util/styles'

css div d:flex flf:row wrap pi:center jc:flex-start

# ---
import {projects} from 'util/data'

let choices = []

imba.mount do <section>
    <select multiple bind=choices> for item in projects
        <option value=item> item.name
    <label> "Interested in"
    <div> for item in choices
        <div[color:{item.color}]> item.name
```

##### button

```imba
# ~preview=md
import {genres} from 'imdb'
import 'util/styles'

# ---
let state = 'one'
css button.checked bxs:inset bg:gray2 o:0.6

imba.mount do <section>
    <div.group>
        <button bind=state value='one'> "one"
        <button bind=state value='two'> "two"
    <label> "State is {state}"
```

Buttons bound to data behave just like checkboxes. A `checked` class indicates when their value matches the bound data. Clicking a button multiple times will toggle just like a checkbox.

##### custom elements

```imba
# ~preview=lg
import 'util/styles'

# ---
let options = {
    width: 12
    height: 12
    title: 'Something'
}

tag Field
    get type
        typeof data == 'number' ? 'range' : 'text'

    <self[d:flex js:stretch]>
        <label[w:80px]> <slot> 'Field'
        <input[flex:1] type=type bind=data>

imba.mount do <section>
    <Field bind=options.title> 'Title'
    <Field bind=options.width> 'Width'
    <Field bind=options.height> 'Height'
    <label> "{options.title} is {options.width}x{options.height}"
```

##### combination

```imba
# ~preview=xl
import {genres} from 'imdb'
import 'util/styles'

css div d:flex flf:row wrap pi:center jc:flex-start

# ---
let people = [{name: 'Jane Doe', interests: ['Imba']}]
let person = people[0]

def addPerson
    person = {name: 'John',interests:[]}
    people.push(person)

def addInterest e
    person.interests.push e.target.value
    e.target.value = ''

imba.mount do <main>
    <header>
        <select bind=person>  for item in people
            <option value=item> item.name
        <button[ml:2] @click=addPerson> 'Add'
    <article>
        <label[ta:left]> "Editing {person.name}:"
        <input bind=person.name placeholder="Name...">
        <input placeholder="Add interest..." @keyup.enter.prevent=addInterest>
        <div.tags> for item in person.interests
            <button[mr:1].chip bind=person.interests value=item> item
```

# Component Lifecycle

## Lifecycle Hooks

These methods are meant to be defined in your components. In most cases you will only define a `render` method, and possibly `awaken` if you want to do some additional initialization when the element is first attached to the document.

| table       |                                                         |     |
| ----------- | ------------------------------------------------------- | --- |
| `build`     | Called before any properties etc are set                |     |
| `setup`     | Called the first time element is rendered in template   |     |
| `hydrate`   | Called before awaken if element is not hydrated         |     |
| `dehydrate` | Called before serializing when rendering on server      |     |
| `awaken`    | Called the first time the component is mounted          |     |
| `mount`     | Called when the component is attached to the document   |     |
| `unmount`   | Called when the component is detached from the document |     |
| `render`    | Called by both visit and tick                           |     |
| `rendered`  | Called after every `render`                             |     |
| `tick`      | Called on every imba.commit when component is scheduled |
| `visit`     | Called when parent element is rendered                  |
| `commit`    | Called by both visit and tick                           |

## Lifecycle States

Components also has a bunch of methods that you can call to inspect where in the lifecycle a component is:

| table        |                                                                            |
| ------------ | -------------------------------------------------------------------------- |
| `hydrated?`  | Is this element created on the client (by imba) or has it been rehydrated? |
| `awakened?`  | Called the first time the tag is mounted                                   |
| `mounting?`  | Is component in the process of being mounted?                              |
| `mounted?`   | Is component attached to the document?                                     |
| `render?`    | Should component render?                                                   |
| `rendered?`  | Has component been rendered?                                               |
| `scheduled?` | Is component scheduled?                                                    |

# Server-side Rendering [wip]

See [ssr-app-imba](https://github.com/imba/ssr-app-imba) repository as an example.
