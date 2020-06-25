# Elements

DOM nodes are first-class citizens in Imba, meaning that they can be instantiated using a literal syntax. They are *actual DOM elements*. We are not using a virtual DOM.


## Literals

##### plain
```imba
<div> "Hello"
```

##### with id
```imba
<div#main> "Hello"
```

##### with properties
```imba
<div lang="en" title=data.title> "Hello"
```

##### with classes
```imba
# add note and editorial classes
<div.note.editorial> "Hello"
```

##### with conditional classes
```imba
# resolved will only be added if data.isResolved is truthy
<div.note.editorial .resolved=data.isResolved> "Hello"
```

##### with dynamic classes
```imba
let marks = 'rounded important'
let state = 'done'
let color = 'blue'
# ---
# A dynamic class-name can consist of both static and 
# interpolated parts like `.state-{data.state}` and `.bg-{color}-200`
<div.item .{marks} .{state} .bg-{color}-200> "Hello"
```

##### with conditional & dynamic classes
```imba
# dynamic classes can also be conditional
<div.item .theme-{user.theme}=app.loggedIn> "Hello"
```

##### with styles
```imba
<div[color:red bg:blue padding:8px]> "Hello"
```

##### with conditional styles
```imba
<div[color:red bg:blue] [display:none]=app.loggedIn> "Hello"
```

##### with dynamic type
```imba
# ~preview
import 'util/styles'
# ---
let types = ['div','section','button']
imba.mount do <div> for type in types
    <{type}> "is {type}"
```

## Trees

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
Since tags are first-class citizens in Imba, you can use conditionals, loops and more directly inside the tag trees
```imba
<div>
    if items
        <h1> "List of items:"
        <ul> for item in items
            <li> <span> item
```

There isn't really a difference between templating syntax and other code in Imba. Tag trees are just code, so logic and control flow statements work as you would expect. To render dynamic lists of items you simply write a `for` loop where you want the children to be:

```imba
# ~preview
import 'util/styles'
css body jc:stretch
# ---
import {movies} from 'imdb'
# Render first 10 movies in array
imba.mount do
    <ul> for movie,i in movies when i < 10
        <li> movie.title
```

You can use break, continue and other control flow concepts as well:

```imba
# ~preview
import {movies} from 'imdb'

css .heading c:blue7 fs:xs fw:bold p:2 bc:gray3 bbw:1 pos:sticky t:0 bg:white
css .item mx:2 d:flex px:2 py:3 bc:gray2 bbw:1 bg.hover:gray1
css .title px:1 t:truncate
css .number radius:3 px:2 bg:blue2 mr:1 fs:xs c:blue7 d:grid pc:center

# ---
imba.mount do
    <div.list> for movie,i in movies
        if i % 10 == 0
            # Add a heading for every 10th item
            <div.heading> "{i + 1} to {i + 10}"
        <div.item>
            <span.number> i + 1
            <span.title> movie.title
        # break out of the loop early
        break if movie.title == 'The Usual Suspects'
```

# Rendering

The fact that tag literals in imba generate real dom nodes means that we are not using a virtual dom.

```imba
# ~preview
import 'util/styles'

# ---
let array = ["First","Second","Third"]

let view = <main>
    <button @click=array.push('More')> 'Add'
    <ul.list> for item in array
        <li> item

# view is a real native DOM element
document.body.appendChild view
```
Even tough we rendered a dynamic list of items, it won't update if new items are added to the array or if members of the array change. Clicking the button will actually add items, but our view is clearly not keeping up. What to do?

## Mounting

To make the tag tree update when our data changes, we need to add pass the tree to `imba.mount`.

```imba
# ~preview
import 'util/styles'

# ---
let array = ["First","Second","Third"]

imba.mount do 
    <main>
        <button @click=array.push('More')> 'Add'
        <ul.list> for item in array
            <li> item
```
Now you will see that when you click the button, our view instantly updates to reflect the new state. How does this happen without a virtual dom? The array is not being tracked in a special way (it is just a plain array), and we are only dealing with real dom elements, which are only changed and updated when there is real need for it. Imba uses a technique we call `memoized dom`, and you can read more about how it works [here](https://medium.com/free-code-camp/the-virtual-dom-is-slow-meet-the-memoized-dom-bb19f546cc52). Here is a more advanced example with more dynamic data and even dynamic inline styles:

```imba
# ~preview
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

By default Imba will **render your whole application whenever anything *may* have changed**. Imba isn't tracking anything. This sounds insane right? Isn't there a reason for all the incredibly complex state management libraries and patterns that track updates and wraps your data in proxies and all that?

## State Management

Most frameworks for developing web applications try to solve one thing well; update views automatically when the underlying data changes. If it is too slow to traverse the whole application to ensure that every view is in sync with the data - we *have to* introduce state management and potentially other confusing concepts like React Hooks, Concurrent mode etc.

Imba does dom reconciliation in a completely new way, which is orders of magnitutes faster than other approaches. Because of this we really don't need to think about state management. There is no need for observable objects, immutable data-structures etc. This probably sounds naive, but it is true. Even in a complex platform like [scrimba.com](https://scrimba.com) we don't use any state-management framework at all. Our data is not observable. We re-render the whole application all the time. It just works.

## Forcing Reconcilation

As long as you have mounted your root element using `imba.mount` you usually don't need to think more about it. The default approach of Imba is to re-render the mounted application after every handled DOM event. If a handler is asynchronous (using await or returning a promise), Imba will also re-render after the promise is finished. Practically all state changes in applications happen as a result of some user interaction.

In the few occasions where you need to manually make sure views are updated, you should call `imba.commit`. `imba.commit` is asynchronous, and rendering in Imba is extremely performant, so don't be afraid of calling it too many times.

`imba.commit` is asynchronous. It schedules an update for the next animation frame, and things will only be rerendered once even if you call `imba.commit` a thousand times. It returns a promise that resolves after the actual updates are completed, which is practical when you need to ensure that the view is in sync before doing something.


##### commit from websocket
```imba
# Call imba.commit after every message from socket
socket.addEventListener('message',imba.commit)
```

##### commit after fetching data
```imba
def load
    let res = await window.fetch("/items")
    state.items = await res.json!
    imba.commit!
```

# State Management

# Form Input Bindings

##### text
```imba
# ~preview
import 'util/styles'

# ---
let message = "Hello"

imba.mount do <section>
	<input type='text' bind=message>
	<label> "Message is {message}"
```

##### range
```imba
# ~preview
import 'util/styles'

# ---
let point = {r:0, x:0}

imba.mount do <section[gap:1]>
    <input type='range' min=0 max=100 bind=point.x>
    <input type='range' min=0 max=100 bind=point.r>
    <label[js:center w:40px rotate:{point.r}deg x:{point.x}]> "{point.x},{point.r}"
```

##### number
```imba
# ~preview
import 'util/styles'

# ---
let a=1, b=2

imba.mount do <div>
    <input type='number' min=0 max=100 bind=a/> " + "
    <input type='number' min=0 max=100 bind=b/> " = "
    <var> "{a + b}"
```

##### checkbox
```imba
# ~preview
import 'util/styles'
# ---
let bool=no
imba.mount do <section>
    <label> <input[mr:1] type='checkbox' bind=bool /> "Enabled: {bool}"
```
##### checkbox with array
```imba
# ~preview
import 'util/styles'
css section d:flex flf: row wrap pi:center jc:flex-start
# ---
import {genres} from 'imdb'
let interests = []
imba.mount do <section>
    for genre in genres
        <label[mr:2]>
            <input type='checkbox' bind=interests value=genre/>
            <span[pl:1]> genre
    <label> "Selected {interests.join(', ')}"
```

## Multiple checkboxes

## Radio inputs

## Select

## Select multiple

## Custom binding

```imba
# ~preview
css body p:4 user-select:none

tag x-checkbox
	def render
		<self> <label.block>
			<input type='checkbox' bind=data>
			<span[pl:1]> <slot>

const state = { enabled: no }

imba.mount do <main>
	<x-checkbox bind=state.enabled> 'Enable'
	if state.enabled
		<span[pl:1 c:gray6]> 'State is enabled'
```

# Event Handling