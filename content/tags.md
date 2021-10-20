---
title:Tags
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

## Setting Classes

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

## Setting Properties

As you've already seen you can add properties to the elements just like you would in HTML. Beware that imba compiles to setting actual properties on the dom nodes instead of using setAttribute.

```imba
<div lang="en" title=data.title> "Hello"
```

## Setting Styles

Read the Styling section for in-depth documentation about styling, both via selectors and inline on elements.

```imba
<div[color:red bg:blue padding:8px]> "Hello"
```

Just like classes, styles can be conditionally applied

```imba
<div[color:red bg:blue] [display:none]=app.loggedIn> "Hello"
```

## Adding Event Listeners

We can use `<tag @event=expression>` to listen to DOM events and run `expression` when they’re triggered. See [Events Documentation](/events/listening-to-events).

```imba
let counter = 0
<button @click=(counter++)> "Increment to {counter + 1}"
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
# [preview=lg]
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

Even though we rendered a dynamic list of items, it won't update if new items are added to the array or if members of the array change. Clicking the button will actually add items, but our view is clearly not keeping up. What to do?

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
# [preview=lg]
import 'util/styles'

css div pos:absolute d:block inset:0 p:4
css mark pos:absolute
css li d:inline-block px:1 m:1 rd:2 fs:xs bg:gray1 @hover:blue2

# ---
let x = 20
let y = 20
let title = "Hey"

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


```imba fragment.imba
tag app-dialog
	def render
		<self>
			<header> "Dialog header"
			<.body> body!


	def body
		<> # Returns all elements without any wrapping element
			<h3> "Body text"
			<p> "With some adjecent content"

	# Because imba returns the last statement this function would only return the <p> element
	def bad-body
		<h3> "Body text"
		<p> "With some adjecent content"

```


# Custom Components

Components are reusable elements with functionality and children attached to them. Components are _just like regular classes_ and uses all the same syntax to declare properties, methods, getters and setters. To create a component, use the keyword `tag` followed by a component name.

```imba
# lowercased tags are registered globally and are available
# anywhere in your project.
tag app-component
    # add methods, properties, ...

# uppercased tags are not registered globally and must be
# exported/imported explicitly to be used in your project
export tag AppComponent
	# methods, properties, ...
```

Components with lowercased names containing at least two words separated by a dash are compiled directly to global [native Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components). As long as you have imported the component _somewhere in your code_, you can create instances of the component anywhere.

Components whose name begins with an uppercase letter are considered local components. They act just like web components, but are not registered globally, and must be exported + imported from other files to be used in your project. Very useful when you want to define custom components that are local to a subsystem of your application.

```imba app.imba
# [preview=md]
import './controls'
import {Sidebar} from './sidebar'
import {Header} from './header'

tag App
    <self>
        <Header>
        <Sidebar> <app-button> "Launch"
        <main> "Application"

imba.mount <App>
```

```imba controls.imba
# as long as this file is imported somewhere in your project
# <app-button> will be available anywhere
tag app-button
    <self[d:contents]> <button @click.emit-exec> <slot> "Button"
```

```imba sidebar.imba
export tag Sidebar
    <self[d:inline-block p:2]>
    	"Sidebar here"
    	<slot>
```

```imba header.imba
export tag Header
    <self[d:inline-block p:2]> "Header"
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

## The Global Tag

You can use the special `<global>` tag within your elements for two main purposes:

#### 1. Global Event Handlers [preview=md]

If your element needs to attach a global event handler, do it on the `<global>` tag. This is useful for things like keyboard shortcuts, or listening for mouse events that happen outside of the element. Event listeners on the `<global>` tag will be removed when the element is unmounted.

There is an event modifier called `outside` that can be used in conjunction with mouse events on the global tag. This will limit the event to firing when it happens outside of the element. It's demonstrated below.

```imba
import 'util/styles'

# ---
tag my-menu
	css .menu-container shadow:0 0 0 1px black/10, lg rd:5px mt:5px o:0 ml:10px of:hidden tween:all 300ms ease
		.menu-item p:5px 10px bdb:1px solid cooler2 @last:none bgc:white @hover: blue5 c:gray8 @hover:white cursor:pointer

	showMenu = false

	<self>

		<global
			@click.outside=(showMenu = false)
			@keydown=(showMenu = false if e.key === 'Escape')
		>

		<div[d:flex]>
			<button @click=(showMenu = !showMenu)> "Toggle Menu"
			<div.menu-container [opacity:1]=showMenu>
				<div.menu-item> "Click Outside"
				<div.menu-item> "Or Press Escape"
# ---

imba.mount <my-menu>
```

#### 2. Appending to Body [preview=md]

Content nested within the `<global>` tag will be appended to the document's `<body>`. You can think of it like a slot, or portal. This can be useful for things such as modal windows with should appear above everything else.

When your element unmounts, content added to `<global>` will also be unmounted.

```imba
import 'util/styles'

# ---
tag my-menu

	css .modal-window zi:10 c:white pos:absolute t:50% l:50% x:-50% y:-50% bgc:black/70 p:30px rd:10px

	showModal = false

	<self>
		<button @click=(showModal = !showModal)> "Toggle Modal"
		<global>
			if showModal
				<div.modal-window @click=(showModal = false)>
					<h1> "This is appended to the body tag"

# ---

imba.mount <my-menu>
```

## Declaring Attributes [wip]

# Declarative Rendering

The virtual DOM was a fantastic innovation. It brought about a much more productive way of writing web applications by allowing us to write our views in a declarative manner. Declarative rendering is only possible if the process of re-rendering is fast enough. To do this, virtual DOMs essentially render a lightweight representation of your view, compares it to the previous lightweight representation, and only *patch* the real DOM with the changes.

This process is still quite slow, and to work around these inherent challenges we've resorted to complex state management frameworks that carefully track the changing data, making sure that only specific views need to re-render. Even with this in place, rendering complex lists and very dynamic views can often become sluggish. What if we could get better performance in a world where the data layer and view layer don’t really know or care about each other?

Imba introduces a *revolutionary* new way of reconciling your dom which is orders of magnitutes faster than existing virtual DOM approaches. Understanding the basic concepts is invaluable to get a deep understanding of how to make things with Imba.

## How it Works

DOM nodes in Imba are *not* virtual, they are in fact real elements:

```imba
let el = <div.large title="Item">
console.log el # HTMLDivElement
console.log el.outerHTML # <div class='large' title='Item'>
```

Let's look at a simple component and go through the generated code line by line. 

```imba
let number = 1
let bool = false

tag App
	<self .ready=bool>
		<h1.header> "Number is {number}"

```

The component above will roughly compile to something like the following. Feel free to skip this part if it seems hard to understand, but please get back to it. Once you get a deep understand the simple yet powerful way Imba does rendering it will make you a much more powerful developer.

```js
/*
This is handcrafted pseudocode – the real imba output is
more optimised and compact, making it a little harder to
understand.
*/
let number = 1;
let bool = false;

class App extends HTMLImbaElement {
	render(){
		var $ = (this.cache || this.cache = {});
		
		// toggle the class name on the App element - based on
		// value of bool, and cache the valua for later checks
		if($.val != bool) this.classList.toggle('ready',$.val = bool)

		if(!$.rendered){
			$.h1 = this.appendChild('h1') // add h1 and cache element
			$.h1.className = "header"; // only on first render
			$.h1.insertText("Number is "); // only on first render
			$.t1 = h1.insertText(number); // add text and cache textnode
		} else {
			// has been rendered previously, not much to do!
			$.t1.textContent = number; // update the text of the textnode
		}		
		$.rendered = true; // mark App as rendered
		// nothing is returned from render
	}
};
```

Try to read this code, and figure out what will happen the first time `app.render()` is called, and what will happen the second time.

In a framework like react, the idea is that the render method creates a virtual dom tree *and returns it*. Every time you call render it will generate a new tree. This tree will be taken by the dom reconciler to compare to some previously cached version, create a diff, and patch the real DOM with the changes.

In Imba, calling render will *actually* create and then later modify the *real* DOM elements to make sure they appear the way you have declared. So after the first render, calling render on the `App` element above will only run a minimal number of instructions. The result is that re-rendering in Imba is so fast that you can literally render your whole application, from root, regularly.

### Basic example

```imba main.imba
global css body d:flex ja:center
# ---
let number = 1
tag App
	<self>
		<h1.header> "Number is {number}"

document.body.appendChild <App>
```

Here we created an `<App>` element and added it to the body. As you can see, it prints the text as it should, but if the number changes, it will still read "Number is 1" in the DOM. Now let's add some methods to see if we can re-render:

```imba main.imba
# [footer] [preview=md]
global css body d:flex ja:center
# ---
let number = 1
tag App
	<self>
		<h1.header> "Number is {number}"

let el = <App>
document.body.appendChild el

export def update
	number = Math.random!
	el.render! # call render manually
# ---
export const actionzs = {
	"number += 1": do
		number += 1
		console.log "incremented number to {number}"
	"el.render()": do el.render!
}
```

As you can see, whenever we call `render` on the element it makes sure to update the dom if anything has changed. Also, when render is called on an element, all the custom children will also be re-rendered:

```imba main.imba
# [footer] [preview=lg]
global css body d:flex ja:center
# ---
tag Item
	css d:block px:1 m:1 bg:blue2 fs:sm rd:md
	<self> "Changes on every render: {Math.random!}"
		
tag App
	<self>
		<Item>
		<Item>

document.body.appendChild let el = <App>
# ---
export const actions = {
	"el.render": do el.render!
}
```

## Automatic rendering

Calling render manually on your elements is cumbersome and doesn't really scale. Instead, imba automatically calls render on your mounted elements whenever an event has been triggered *and* handled by a listener. The only thing you need to do is to add your root element using `imba.mount` instead of `document.body.appendChild`.

```imba
# [preview=xl]
import 'util/styles'

css div pos:absolute d:block inset:0 p:4
css mark pos:absolute
css li d:inline-block px:1 m:1 rd:2 fs:xs bg:gray1 @hover:blue2
# ---
let x = 20
let y = 20
let title = "Hey"
# mount our elements via imba.mount
imba.mount do
    <main @mousemove=(x=e.x,y=e.y)>
        <input bind=title>
        <label> "Mouse is at {x} {y}"
        <mark[x:{x} y:{y} rotate:{x / 360}]> "Item"
        <ul> for nr in [0 ... y]
            <li> nr % 12 and nr or title
```
Move your mouse around and see how everything updates instantly. This is just a tiny preview of how fast and powerful the declarative rendering in Imba is. Because we listen to a `@mousemove` event, Imba will automatically call render on the mounted element.

## Manual rendering

The default approach of Imba is to re-render the mounted application after every handled DOM event. If a handler is asynchronous (using await or returning a promise), Imba will also re-render after the promise is finished. Practically all state changes in applications happen as a result of some user interaction.

In the few occasions where you need to manually make sure views are updated, you can call `imba.commit`. This is also what the event handlers are using under the hood. It schedules an update for the next animation frame. It returns a promise that resolves after the actual updates are completed, which is practical when you need to ensure that the view is in sync before doing something. Things will only be rerendered once even if you call `imba.commit` a thousand times.

Manually calling `imba.commit` is usually only needed when dealing with receiving data asynchronously (not as a result of a user interaction / event). So, if you receive data via a websocket, the only thing you need to make your whole application magically stay in sync with your data is to call imba.commit whenever you receive data from your socket.

```imba
websocket.addEventListener('message',imba.commit)
```

Or, if you fetch some data via window.fetch, and it doesnt happen asynchronously as part of an event handler, just make sure to call `imba.commit` afterwards:

```imba
def load
    let res = await window.fetch("/items")
    state.items = await res.json!
    imba.commit!
```

## Custom scheduling

Let's say you have a clock, or some other element that needs to re-render at specific intervals, or more often than the rest of your app. Remember, the only thing that really happens when we render is that `.render()` is called on elements. So, manually you could add an interval to specific elements:

```imba
# [preview=md]
import 'util/styles'
# ---
tag Clock
    css d:block p:2 bd:1px solid gray4 m:2 ta:center
    def mount   do #interval = setInterval(render.bind(self),1000)
    def unmount do clearInterval(#interval)
    def render  do <self> <span> (new Date).toLocaleString!

imba.mount do
    <div @click.log('clicked')>
        <span> "Rendered on click {Math.random!}"
        <Clock>
```
As you can see, the clock is actually updating every second. It is a little cumbersome to setup and teardown the intervals though, and since this is a pretty common pattern, Imba has a better way to do this, using the `autorender` property.

```imba
# [preview=md]
import 'util/styles'
# ---
tag Clock
    css d:block p:2 bd:1px solid gray4 m:2 ta:center
    <self> <span> (new Date).toLocaleString!

imba.mount do
    <div @click.log('clicked')>
        <span> "Rendered on click {Math.random!}"
        <Clock autorender=1s>
```

Let's create some proper clocks, and show a few autorender values:

```imba
# [preview=xl]
import 'util/styles'
global css body d:block
# ---
tag app-clock
	prop utc
	
	def render
		let ts = Date.now! / 60000 + utc * 60
		<self.clock>
			<div.dial.h[rotate:{ts / 720}]> <i>
			<div.dial.m[rotate:{ts / 60}]> <i>
			<div.dial.s[rotate:{ts}]> <i/> <b>

imba.mount do
    <div.clocks>
        <app-clock autorender=1s title='New York' utc=-5>
        <app-clock autorender=500ms title='San Fran' utc=-8>
        <app-clock autorender=10fps title='London' utc=0>
        <app-clock autorender=60fps title='Tokyo' utc=9>
```

# Form Input Bindings

## Examples

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
let a=1
let b=2

imba.mount do <div.group>
    <input type='number' min=0 max=100 bind=a/> " + "
    <input type='number' min=0 max=100 bind=b/> " = "
    <samp> "{a + b}"
```

##### checkbox [preview=md]

```imba
# [preview=md]
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
# [preview=md]
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
# [preview=md]
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
# [preview=md]
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
# [preview=lg]
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
# [preview=md]
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
# [preview=lg]
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
# [preview=xl]
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

# Handling Events

## Basic syntax

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

## Event Modifiers

Inspired by vue.js, Imba supports event modifiers. More often than not, event handlers are simple functions that do some benign thing with the incoming event (stopPropagation, preventDefault etc), and then continues on with the actual logic. By using modifiers directly where we bind to an event, our handlers can be pure logic without any knowledge of the event that triggered them.

<api-modifiers-list></api-modifiers-list>

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

# Using Router

Imba comes with a built-in router that works on both client and server. It requires no setup and merely introduces the `route` and `route-to` properties on elements. The router for your application is always available via `imba.router`.

```imba app.imba
# [preview=lg] [titlebar] [route=/home]
import './styles.imba'
import './about.imba'

tag App
    <self>
        <nav>
            <a route-to='/home'> "Home"
            <a route-to='/about'> "About"
            <a href='/more'> "More"

        <div route='/home'> "Welcome"
        <about-page route='/about'>
        <div route='/more'> "More..."

imba.mount <App.app>
```

```imba about.imba
tag about-page < main
    <self>
        <aside>
            <a route-to="team"> "Team"
            <a route-to="contact"> "Contact"
        <section>
            <div route=''> "Stuff about us. Click the links to the right"
            <div route='team'> "Our team"
            <div route='contact'> "Contact us at"
```

```imba styles.imba
import 'util/styles'
# ---
global css @root
    # links using route-to gets an .active flag when the
    # route is matching
    a.active td:none c:gray8
    aside fl:0 0 120px d:vflex j:flex-start px:2 bdr:gray3 fs:sm
    main d:hflex ac:stretch
    section fl:1
```

As you can see with the `More` link, regular links with `href` attributes will also be intercepted by the router. The difference is that `route-to` adds some powerful features like nested routes (see below), and `route-to` will automatically add an `active` class to the element whenever the route it links to is matching.

## Route matching

When using `route` to determine when components should render, the string you pass to route is a regex pattern which will be tested against the current route. Thus if you have multiple components that match part of the request path, they will all render, as shown in this example:

```imba matching.imba
tag app
	<self>
		<nav>
			<a route-to="/"> "Home Page"
			<a route-to="/test"> "Test Page"
			<a route-to="/test/inner"> "Inner Page"
		
		<home route="/"> # this will render on /, /test, and /test/inner
		<test route="/test"> # this will renderon /test and /test/inner
		<inner route="/test/inner"> # this will render on /test/inner
```

If you want these to be _exact matches_ only, then you should use `$` at the end of the path, as shown below. This is true for both the `route-to` and `route` calls:

```imba exact-matching.imba
tag app
	<self>
		<nav>
			<a route-to="/$"> "Home Page"
			<a route-to="/test$"> "Test Page"
			<a route-to="/test/inner$"> "Inner Page"
		
		<home route="/$"> # this will only render on /
		<test route="/test$"> # this will only render on /test
		<inner route="/test/inner$"> # this will only render on /test/inner
```

## Nested Routes

Routes that do not start with `/` will be treated as nested routes, and resolve relative to the closest parent route. This works for both `route` and `route-to`.

## Dynamic Routes

To map a url pattern to a component, you can use dynamic segments in your routes. A dynamic segment starts with `:`. So the pattern `/user/:id` with match `/user/1`, `/user/2` etc. You can have multiple dynamic segments in a route, like `/genre/:id/movies/:page`. All segments map to corresponding fields in `route.params`. When using nested routes, even the params from parent routes will be available in `route.params`.

```imba app.imba
# [preview=lg] [titlebar] [route=/genre/drama]
import 'util/styles'
# ---
import {genres} from 'imdb'

tag Genre
    <self> "Genre with id {route.params.id}"

tag App
    <self>
        # render links for all genres
        <nav> for item in genres.top
            <a route-to="/genre/{item.id}"> item.title
        <Genre.page route="/genre/:id">
# ---
imba.mount <App.app>
```

## Loading Data

In the example above, the same `<Genre>` component is used when switching between genres. As you can see, the `id` segment from the route is available via `route.params.id`, and it changes when we switch between genres.

If you want to do something when the params change you can define a `routed` method on your component. This will be called whenever the route changes, and supply the new params, and a state object that is unique for each matched route, but consistent over time (ie. when navigating back to a previously matched set of params).

If you load anything asynchronously inside `routed` (using `await`), the component will delay rendering until `routed` has finished.

A nice feature of the imba router is that the `params` of any particular route match are constant. Matching `/genre/:id` with the url `/genre/action` it will always return the same `params` object! This is useful for memoizing data etc. (More documentations and examples of usecases will come before final release)

In addition to this, `route.state` will always return an object that is unique *per match*, but consistent over time. This is very useful for caching data etc for a `component<->matching-route` combination.

```imba app.imba
# [preview=lg] [titlebar] [route=/genre/drama]
import 'util/styles'
# ---
import {genres} from 'imdb'

tag Genre
    def routed params, state
        console.log 'routed',params
        data = state.genre ||= await genres.fetch(params.id)

    <self[d:vflex o@suspended:0.4]>
        <div> "{data.title} has {data.movies.length} movies in top 250"
# ---
tag App
    <self>
        <nav> for item in genres.top
            <a route-to="/genre/{item.id}"> item.title
        <Genre.page route="/genre/:id">
imba.mount <App.app>
```
As you can see in the example above, we cache data in the `state` object supplied to `routed`. This will make sure you don't refetch the data when you click on a genre you've seen before.


# Importing Assets

Images, stylesheets and other assets are an important part of any web application. These things are integrated right into imba without any need for external bundlers like webpack or rollup. 

## Importing stylesheets

Even though you can style all of your app using the imba css syntax you might want to import external stylesheets as well. Import these just like you would import any other file.

```imba app.imba
import './assets/normalize.css'

tag App
	# ...
```

In the example above, the content of the normalize.css file will automagically be imported and bundled alongside your other styles.

You can also import the css generated by imba via a non-standard `src` attribute on the `style` element. This is especially useful for ssr applications where you don't want to ship your rendering code to the client, but obviously want the styles:

```imba server.imba
import {App} from './app'
app.get(/.*/) do(req,res)
	res.send String <html>
		<head>
			<title> "Application"
			<style src='./app'>
		<body> <App>
```

```imba app.imba
global css
	body bg:gray2 # ...

export tag App
	<self>
		<div[fw:bold]> "Welcome"
```

## Importing images

Any relative url reference you have in your styles will be extracted, hashed, and included with your bundled code.

```imba app.imba
tag App
	<self> <div[ bg:url(./logo.png) ]>
```

Also, relative src attributes on `<img>` elements will automatically be handled as assets

```imba app.imba
tag App
	<self> <img src='./logo.png'>
```

If you want to reference and use these images from your code as well, you can import them:

```imba app.imba
import logo from './logo.png'

tag App
	<self> <img src=logo>
```

These imported assets even have valuable metadata added to them:

```imba app.imba
import logo from './logo.png'

logo.url # the unique hashed url for this image
logo.size # size of assets - in bytes
logo.hash # unique hash of the contents of the asset
logo.body # the actual contents of the asset - only available on server
logo.width # width of the imported image
logo.height # height of the imported image

tag App
	<self> <img src=logo width=logo.width>
```

You can also use the dynamic import syntax for assets:

```imba app.imba
const states = {
	open: import('./icons/alert-circle.svg')
	closed: import('./icons/check-circle.svg')
	archived: import('./icons/package.svg')
}

<div> for issue in issues
	<div>
		<img.icon src=states[issue.state]>
		<span> issue.title
```

You can even interpolate these dynamic asset imports in css:

```imba app.imba
const states = {
	open: import('./icons/alert-circle.svg')
	closed: import('./icons/check-circle.svg')
	archived: import('./icons/package.svg')
}

<div> for issue in issues
	<div>
		<.icon[ bg:{states[issue.state]} ]>
		<.title> issue.title
```

## Importing svgs

SVGs can be imported and used just like other image assets described in the previous section. It does include some nice additional things though. You can use SVG images via css and the img-tag, but they really shine when you inline them in your html. Ie, if you want to use SVG images for icons you have to inline them to be able to change their color, stroke-width etc.

So, Imba adds a non-standard `src` attribute to `svg` elements, that magically inlines the actual content of the svg directly in your html.

```imba app.imba
<div>
	# the package.svg will now be inlined in this tag
	<svg src='./icons/package.svg'>
```

This also allows us to style the contents directly:

```imba app.imba
<div>
	# change color on hover
	<svg[c:gray6 @hover:blue7] src='./icons/package.svg'>
	# override stroke-width 
	<svg[stroke-width:4px] src='./icons/check.svg'>
```

## Importing scripts

Imba will analyze the `src` attribute of `script` elements and automatically package these files for you. So a typical project with server *and* client code will follow this pattern:

```imba server.imba
# some express server ...
app.on(/.*/) do(req,res)
	res.send String <html>
		<head>
			<title> "Gobias Industries"
		<body>
			<script type="module" src="./client">
```

```imba client.imba
# some client code here
```

When you run `imba server.imba` in the above example, imba will discover the reference to client.imba and create a bundle for the `client.imba` entrypoint. Using [esbuild](https://esbuild.github.io/) in the background, bundling is so fast that it literally happens every time you start your server – *there is no need for a separate build step*.

## Importing workers

Imba aims for zero-configuration bundling even with large projects. You can import scripts as separate assets via a special import syntax.

```imba app.imba

const script = import.worker './compiler'
# script is now an asset reference to the bundled compiler entrypoint.
script.url # reference to the unique/hashed url of this script
script.body # node only - actual contents of the bundle

const worker = new Worker(script.url)
```

To showcase how flexible and useful this is – on imba.io we are using a serviceworker to run examples. Serviceworkers need to be served from the directory / scope you want them to control, and their url need to be static. The asset urls generated by imba are usually hashed *and* put inside a special `__assets__` folder:

```imba app.imba
const sw = import.worker './sw/service'
sw.url # /__assets__/sw/worker.JNA7FI8P.js
```
This url changes whenever the content changes and is nested inside an `/__assets__/...` prefix, both of which can be challenging for a serviceworker. So, our solution was to create a static route in our server, and just serve the asset directly:

```imba app.imba
app.get('/sw.js') do(req,res)
	const asset = import.worker('./sw/service')
	res.send asset.body
```

## Custom imports

The `import.worker` syntax shown in the previous section is not a special syntax just for workers. In fact, the `import.anything(...)` is a general way to import something using a specific configuration. You can create such configurations in your `imbaconfig.json`. Imba comes with a few presets:

```imba presets.imba
export const presets = 
	node:
		platform: 'node'
		format: 'cjs'
		sourcemap: true
		target: ['node12.19.0']
		external: ['dependencies','!imba']
		
	web:
		platform: 'browser'
		target: ['es2020','chrome58','firefox57','safari11','edge16']
		sourcemap: true
		format: 'esm'
		
	iife:
		extends: 'web'
		format: 'iife'
		
	client:
		extends: 'web'
		splitting: true
		
	worker:
		format: 'esm'
		platform: 'worker'
		splitting: false

```

Most of the properties map directly to [esbuild options](https://esbuild.github.io/api/#simple-options), with some additions for imba specific things. Configuration options will be explained in more detail before final 2.0 release. In most projects you will not need to think about or tweak these configs.

## Future plans

### Glob imports

We are working on smart glob imports for a future release.

```imba app.imba
import icons from './feather/*.svg'

# contains all matching assets:
icons.check
icons.circle
...
```

This will also work directly in src paths, like:

```imba app.imba
<div> for issue in issues
	<div>
		<svg src="./icons/{issue.state}.svg">
		<div.title> issue.title
```

### Importing wasm

Will be part of a future release.

# Server-Side Rendering [wip]

See [ssr-app-imba](https://github.com/imba/ssr-app-imba) repository as an example.

# State Management

State management in Imba is quite straightforward compared to other frameworks. There's nothing like "set state" or a "store" concept. Your state can be kept in regular Javascript variables, to update your state, update the variables. Your app is re-rendered every time an event is handled or `imba.commit()` is called. Here's a simple example:

You can store the state in a variable at the root of an imba document:
```imba
let count = 0

tag Counter
    <self>
        <div> count
        <button @click=(count = count + 1)> "Add One"
```

Or as a property of a tag:
```imba
# store state as a property on a tag
tag Counter
    prop count = 0
    <self>
        <div> count
        <button @click=(count = count + 1)> "Add One"

tag App
    <self>
        <Counter count=10>
        <Counter count=5>
```


You can extend `element` with a getter which will make a property available in all tags. This is a convenient way to provide global application state everywhere.
```imba
let globalAppState = new MyAppState()

# Extend 'element' with a new property for getting an app state value
extend tag element
    get appState
        return globalAppState

# Now any tag can use the 'appState' property
tag Foo
  <self> appState.someValue
```
