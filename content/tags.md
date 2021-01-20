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


```imba fragment.imba
tag app-dialog
	def render
		<self>
			<header> "Dialog header"
			<.body> body!


	def  body
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

## Declaring Attributes [wip]



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

# Importing Assets

Images, stylesheets and other assets are an important part of any web application. These things are integrated right into imba without any need for external bundlers like webpack or rollup. 

### Importing stylesheets

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

### Importing images

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

### Importing svgs

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

### Importing scripts

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

### Importing workers

Imba aims for zero-configuration bundling even with large projects. You can import scripts as separate assets via a special import syntax.

```imba app.imba

const script = import.worker './compiler'
# script is now an asset reference to the bundled compiler entrypoint.
script.url # reference to the unique/hashed url of this script
script.body # node only - actual contents of the bundle

const worker = new Worker(script.url)
```

### Custom imports

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

### Future plans

#### Glob imports

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

#### Importing wasm

Will be part of a future release.

# Server-Side Rendering [wip]

See [ssr-app-imba](https://github.com/imba/ssr-app-imba) repository as an example.

# State Management [wip]

