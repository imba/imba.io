---
title:Rendering
---

# Basic Syntax

Imba treats DOM elements first-class citizens, on a much deeper level than JSX. Imba does not use a virtual dom but compiles declarative tag trees into an incredibly efficient [memoized dom](https://medium.com/free-code-camp/the-virtual-dom-is-slow-meet-the-memoized-dom-bb19f546cc52), which is orders of magnitute faster than vdom approaches, yet conceptually simpler.

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
Setting a class only when a certain condition is met can be done using `.class=condition`.
```imba
<div.note.editorial .resolved=data.isResolved> "Hello"
```
When you want to add dynamic classes based on data you can use `{}` for interpolation inside class names:
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
css .number radius:3 px:2 bg:blue2 mr:1 fs:xs c:blue7 d:grid pc:center

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
css li d:inline-block px:1 m:1 radius:2 fs:xs bg:gray1 @hover:blue2

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

By default Imba will **render your whole application whenever anything *may* have changed**. Imba isn't tracking anything. This sounds insane right? Isn't there a reason for all the incredibly complex state management libraries and patterns that track updates and wraps your data in proxies and all that? As long as you have mounted your root element using `imba.mount` you usually don't need to think more about it.

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

Fragments can be created using empty tag literals `<>`.

# Custom Components

## Defining Components

Components are reusable elements with functionality and children attached to them. Components are *just like regular classes* and uses all the same syntax to declare properties, methods, getters and setters. To create a component, use the keyword `tag` followed by a component name.

### Global Components

```imba
tag app-component
    # add methods, properties, ...
```

Components with lowercased names containing at least two words separated by a dash are compiled directly to global [native Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components). As long as you have imported the component *somewhere in your code*, you can create instances of the component anywhere.


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

## Self & Rendering

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

## Declaring Attributes

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

## Triggering Events

### Trigger Event from method

To trigger a custom event you call `emit` on the element you want to trigger an event from.
```imba
tag App
    def lateTrigger
        setTimeout(&,1000) do
            emit('lateclick',some: 'data')

    def render
        <div> <button @click=lateTrigger> 'click me'
```


### Trigger event via event listener

You can use the `emit-eventname` modifier to trigger a custom event directly from an event handler.

## Event Modifiers

Inspired by vue.js, Imba supports event modifiers. More often than not, event handlers are simple functions that do some benign thing with the incoming event (stopPropagation, preventDefault etc), and then continues on with the actual logic. By using modifiers directly where we bind to an event, our handlers can be pure logic without any knowledge of the event that triggered them.

### Core Modifiers

##### prevent [event-modifier] [snippet]
```imba
# ~preview
import 'util/styles'

# ---
imba.mount do
	<a href='https://google.com' @click.prevent.log('prevented')> 'Link'
```
> Calls preventDefault on event

##### stop [event-modifier] [snippet]
```imba
# ~preview
import 'util/styles'

# ---
imba.mount do <div.group @click.log('clicked div')>
	<button @click.stop.log('stopped')> 'stop'
	<button @click.log('bubble')> 'bubble'
```
> Calls stopPropagation on event

##### once [event-modifier] [snippet]
```imba
# ~preview
import 'util/styles'
# ---
imba.mount do
    <button @click.once.log('once!')> 'Click me'
```
> The click event will be triggered at most once 

##### capture [event-modifier] [snippet]

```imba
# ~preview
import 'util/styles'

# ---
imba.mount do
	<div @click.capture.stop.log('captured!')>
		<button @click.log('button')> 'Click me'
```

##### passive [event-modifier] [snippet]

```imba
# ~preview
import 'util/styles'

# ---
imba.mount do
	<main[overflow:scroll] @scroll.passive.log('scrolled')>
		<article> "One"
		<article> "Two"
		<article> "Three"
```

### Utility Modifiers

##### log ( ...params ) [event-modifier] [snippet]

```imba
# ~preview=small
import 'util/styles'

# ---
# log to the console
imba.mount do
	<button @click.log('logged!')> 'test'
```

##### wait ( duration = 250ms ) [event-modifier] [snippet]

```imba
# ~preview=small
import 'util/styles'

# ---
# delay subsequent modifiers by duration
imba.mount do <div.group>
	<button @click.wait.log('logged!')> 'default'
	<button @click.wait(100).log('logged!')> 'fast'
	<button @click.log('!').wait(500).log('!!')> 'chained'
```

##### throttle ( ms ) [event-modifier] [snippet]

```imba
# ~preview=small
import 'util/styles'

# ---
# disable handler for duration after triggered 
imba.mount do
	<button @click.throttle(1000).log('clicked')> 'click me'
```

##### emit-*name* ( detail = {} ) [event-modifier] [snippet]

```imba
# ~preview
import 'util/styles'

# ---
# Shorthand for emitting events
imba.mount do
	<div.group @select=console.log(e.type,e.detail)>
		<button @click.emit-select> 'emit'
		<button @click.emit-select(a:1,b:2)> 'with data'
```

##### flag-*name* ( target ) [event-modifier] [snippet]

```imba
# ~preview
import 'util/styles'

# ---
# Add flag while event is being handled
imba.mount do
	<div.group>
		<button @click.flag-busy> 'flag self'
		<button @click.flag-busy('div').wait(1000)> 'flag div'
# Optionally supply a selector / element to flag
```


##### silence [event-modifier] [snippet]
```imba
# ~preview
import 'util/styles'

# ---
let counter = 0
imba.mount do <section>
	<div.group>
		<button @click.silence.log('silenced')> "Silenced"
		<button @click.log('clicked')> "Not silenced"
	<label> "Rendered {++counter} times"
# By default, Imba will commit after all handled events.
# In the few cases you want to suppress this, add the `silence` modifier.
```


### Guard Modifiers

##### self [event-modifier] [snippet]
```imba
# ~preview
import 'util/styles'
# ---
# only trigger handler if event.target is the element itself
imba.mount do 
	<button @click.self.log('clicked self')>
		"Button"
		<b> "Nested"
```

##### sel ( selector ) [event-modifier] [snippet]
```imba
# ~preview
import 'util/styles'

# ---
# only trigger if event.target.closest(selector) is true
imba.mount do <div.group>
	<button @click.log('!')> 'Button'
	<button @click.sel('.pri').log('!!')> 'Button'
	<button.pri @click.sel('.pri').log('!!!')> 'Button'
```

##### if ( expr ) [event-modifier] [snippet]
```imba
# ~preview
import 'util/styles'
# ---
let age = 20
# break chain unless expr is truthy
imba.mount do <div.group>
	<input type='number' bind=age>
	<button @click.if(age > 20).log('drink')> 'drink'
	<button @click.if(age > 16).log('drive')> 'drive'
```

##### keys [snippet]
```imba
# ~preview
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

### System Key Modifiers

System modifier keys are different from regular keys and when used with @keyup events, they have to be pressed when the event is emitted. In other words, @keyup.ctrl will only trigger if you release a key while holding down ctrl. It won’t trigger if you release the ctrl key alone. You can use the following modifiers to trigger event listeners only when the corresponding modifier key is pressed:

##### ctrl [event-modifier] [snippet]
```imba
# ~preview
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

##### alt [event-modifier] [snippet]
```imba
# ~preview
import 'util/styles'

# ---
# break chain unless alt key is pressed
imba.mount do
	<button @click.alt.log('alt+click')> 'alt+click'
```

##### shift [event-modifier] [snippet]
```imba
# ~preview
import 'util/styles'

# ---
# break chain unless shift key is pressed
imba.mount do
	<button @click.shift.log('shift+click')> 'shift+click'
```

##### meta [event-modifier] [snippet]
```imba
# ~preview
import 'util/styles'

# ---
# break chain unless meta key is pressed
# On mac keyboards, meta is the command key (⌘).
# On windows keyboards, meta is the Windows key (⊞)
imba.mount do <button @click.meta.log('meta+click')> 'meta+click'
```

### Pointer Modifiers

Modifiers available for all pointer events – pointerover, pointerenter, pointerdown, pointermove, pointerup, pointercancel, pointerout & pointerleave.

##### mouse [event-modifier] [pointer-modifier] [snippet]
```imba
# ~preview=small
import 'util/styles'

# ---
imba.mount do
	<button @pointerdown.mouse.log('only mouse!')> 'Mouse Only'
```

##### pen [event-modifier] [pointer-modifier] [snippet]
```imba
# ~preview=small
import 'util/styles'

# ---
imba.mount do
	<button @pointerdown.pen.log('only pen!')> 'Pen Only'
```

##### touch [event-modifier] [pointer-modifier] [snippet]
```imba
# ~preview=small
import 'util/styles'

# ---
imba.mount do
	<button @pointerdown.touch.log('only touch!')> 'Touch Only'
```

##### pressure ( threshold = 0.5 ) [event-modifier] [pointer-modifier] [snippet]
```imba
# ~preview=small
import 'util/styles'

# ---
imba.mount do
	<button @pointerdown.pressure.log('pressured?')> 'Button'
```

### Touch Modifiers

The following modifiers are available for the special `touch` event. More in depth examples of these modifiers can be seen in the [Touch](/docs/events/touch) docs.

##### moved ( threshold = 4px ) [event-modifier] [touch-modifier] [snippet]

```imba
# ~preview=lg
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



##### moved-*direction* ( threshold = 4px ) [event-modifier] [touch-modifier] [snippet]
```imba
# ~preview=lg
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

##### sync ( data, xname = 'x', yname = 'y' ) [event-modifier] [touch-modifier] [snippet]

```imba
# ~preview=lg
import 'util/styles'

# ---
tag Draggable
	prop pos = {x:0,y:0}
	<self[w:80px x:{pos.x} y:{pos.y}].rect @touch.sync(pos)>
# ---
imba.mount do <Draggable>
```

A convenient touch modifier that takes care of updating the x,y values of some data during touch. When touch starts sync will remember the initial x,y values and only add/subtract based on movement of the touch.

### Resize Modifiers

### Intersection Modifiers

##### in [event-modifier] [intersection-modifier] [snippet]
```imba
<div @intersect.in=handler>
```
Break unless intersection ratio has increased.

##### out [event-modifier] [intersection-modifier] [snippet]
```imba
<div @intersect.out=handler>
```
Break unless intersection ratio has decreased.

# State Management


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

| table  |  | |
| --- | --- | --- |
| `build` | Called before any properties etc are set | |
| `setup` | Called the first time element is rendered in template  | |
| `hydrate` | Called before awaken if element is not hydrated | |
| `dehydrate` | Called before serializing when rendering on server | |
| `awaken` | Called the first time the component is mounted | |
| `mount` | Called when the component is attached to the document | |
| `unmount` | Called when the component is detached from the document | |
| `render` | Called by both visit and tick | |
| `rendered` | Called after every `render` | |
| `tick` | Called on every imba.commit when component is scheduled |
| `visit` | Called when parent element is rendered |
| `commit` | Called by both visit and tick |

## Lifecycle States

Components also has a bunch of methods that you can call to inspect where in the lifecycle a component is:

| table  |  |
| --- | --- |
| `hydrated?` | Is this element created on the client (by imba) or has it been rehydrated? |
| `awakened?` | Called the first time the tag is mounted |
| `mounting?` | Is component in the process of being mounted? |
| `mounted?` | Is component attached to the document? |
| `render?` | Should component render? |
| `rendered?` | Has component been rendered? |
| `scheduled?` | Is component scheduled? |

# Server-side Rendering

Documentation coming.  See [ssr-app-imba](https://github.com/imba/ssr-app-imba) repository as an example.