# Elements

# Tag Literals

DOM nodes are first-class citizens in Imba, meaning that they can be instantiated using a literal syntax. They are *actual DOM elements*. We are not using a virtual DOM.

##### Create element
```imba
<div.main title='example'> "Hello world"
```

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

# Properties & Classes

##### Setting properties
```imba
<input type="text" value=window.title placeholder="title...">
```
> Properties are set using `prop=value` syntax.

##### Setting ID
```imba
<section#main> "..."
```

##### Adding classes `.classname`
```imba
<div.note.editorial> "Decent example"
```
> Classes are set using a `.classname` syntax reminicent of css.

##### Toggling classes `.classname=condition`
```imba
<div.note.editorial .resolved=data.isResolved> "Decent example"
```
> You can conditionally set classes using the `.classname=condition` syntax, where classes will only be added to the element when `condition` is truthy.

##### Adding dynamic classes `.class{name}`
```imba
let marks = 'rounded important'
let state = 'done'
let color = 'blue'
<div.item .{marks} .{state} .bg-{color}-200>
```
> To set dynamic classes you can use `{}` interpolation.


# Inline Styles


# Custom Elements

```imba
# ~shared
css body = p:5

```

Components are reusable elements with functionality and children attached to them. Components are *just like regular classes* and uses all the same syntax to declare properties, methods, getters and setters. To create a Component, use the keyword `tag` followed by a component name according to web-component's custom component naming convention. It must contain at least two words separated by a dash. 

```imba
tag app-component
    # add methods, properties, ...
```

These components are compiled to [native Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) and are *global* in your project. As long as you have imported the component *somewhere in your code*, you can create instances of the component anywhere.

## Local Components

Custom Elements that start with an uppercase letter is treated as a local component.

Sometimes you want to define custom components that are local to a subsystem of your application. Other parts don't need to know about it, and you definitely don't want it to cause collisions with other parts.
```imba
tag Header
    <self> "App header"

tag App
    <self>
        <Header>
        <main> "Application"
```

As opposed to web components, local components must be exported and imported in the files where they are actually used.

## Functional Components

Any method can essentially act like a component in Imba.

```imba
def app-list items
    <ul> for item in items
        <li> item

const array = [1,2,3]
imba.mount do <div> app-list(array)
```



# Declarative Rendering

Element Literals in Imba are *actual DOM elements*. We are not using a virtual DOM. In the example below we create an element and add it directly to the document:

```imba
let counter = 1
let div = <div> "Counter is {counter}"
document.body.appendChild div
```
If we later change the value of `counter`, it will not automatically update the text of the `div` to reflect this updated state. So, this approach really wouldn't work for any real world application. Instead, we need to add our element using `imba.mount`:

```imba
let counter = 1
imba.mount do <div @click=(counter++)> "Counter is {counter}"
```
> Note that we are not passing the div directly to `imba.mount` but rather a function that returns the div.

We added an event handler that increments the counter when we click the element. Now the view is correctly kept in sync with the underlying state of the program. How does this happen? Under the hood, this counter is *not* being tracked in a special way. It is just a plain number. Take this more advanced example:
```imba
css div = position:absolute display:block inset:0 p:4
css li = display:inline-block px:1 m:1 radius:2 bg:gray1
css li.major = bg:blue2

# ---
const state = {x: 0, y: 0, title: "Something"}

imba.mount do
    <div @mousemove=(state.x=e.x,state.y=e.y)>
        <p> "Mouse is at {state.x} {state.y}"
        if state.x > 350
            <p> "X is over 350!"
        <ul> for nr in [0 ... state.x]
            <li .major=(nr % 10 == 0)> nr
```

By default Imba will **render your whole application whenever anything *may* have changed**. Imba isn't tracking anything. This sounds insane right? Isn't there a reason for all the incredibly complex state management libraries and patterns that track updates and wraps your data in proxies and all sorts of stuff?

### Carefree Declarative Rendering

Most frameworks for developing web applications try to solve one thing well; update views automatically when the underlying data changes. If it is too slow to traverse the whole application to ensure that every view is in sync with the data - we *have to* introduce state management and potentially other confusing concepts like React Hooks, Concurrent mode etc.

Imba does dom reconciliation in a completely new way, which is more than 20 times faster than other approaches. Because of this we really don't need to think about state management. There is no need for observable objects, immutable data-structures etc. 

> This probably sounds naive, but it is true. Even in a complex platform like scrimba.com we don't use any state-management framework at all. Our data is not observable. We simply re-render the whole application all the time. It just works.


## imba.mount

To ensure that your views stay in sync with your application state, you need to mount the root of our application using `imba.mount`.

##### Mounting a component
```imba
tag Counter
    prop counter = 0

    def render
        <self @click=(counter++)> "Counter is {counter}"

imba.mount <Counter>
```

##### Mounting an element
```imba
let counter = 1
imba.mount do
    <div @click=(counter++)> "Counter is {counter}"
```

Under the hood, `imba.mount` essentially only appends the supplied component (or element returned from the supplied function), and hooks it up with the `imba.scheduler` to re-render automatically.

## imba.commit

As long as you have mounted your root element using `imba.mount` you shouldn't need to care about making sure elements are updated to reflect state changes. The default approach of Imba is to re-render the mounted application after every handled DOM event. If a handler is asynchronous (using async/await or returning a promise), Imba will also re-render after this promise is finished. Practically all state changes in applications happen as a result of some user interaction.

In the few occasions where you need to manually make sure views are updated, you should call `imba.commit`. `imba.commit` is asynchronous, and rendering in Imba is extremely performant, so don't be afraid of calling it too many times.

##### Commit from websocket
```imba
# Call imba.commit after every message from socket
socket.addEventListener('message',imba.commit)
```

##### Commit after fetching data
```imba
def load
    let res = await window.fetch("/items")
    appState.items = await res.json!
    imba.commit!
```

`imba.commit` is asynchronous. It schedules an update for the next animation frame, and things will only be rerendered once even if you call `imba.commit` a thousand times. It returns a promise that resolves after the actual updates are completed, which is practical when you need to ensure that the view is in sync before doing something.
```imba
tag App
    prop items = []

    def add
        items.push "Item"
        # item is not yet in the dom
        console.log document.querySelector(".item")
        
        imba.commit!
        # still not rendered - commit is async
        console.log document.querySelector(".item")

        await imba.commit!
        # now that we have waited - view is up-to-date
        console.log document.querySelector(".item")

    <self>
        <button @click=add> "Add item"
        <ul> for item,i in items
            <li.item> "Item number {i}"

imba.mount <App>
```

# Rendering Lists

```imba
# ~shared
import {movies} from 'imdb'

css .list = p:2
css .heading = t:gray6 sm bold p:2
css .item = l:flex px:2 py:3 bb:gray2 bg.hover:gray1
css .title = px:1 t:truncate
css .number = radius:3 px:2 bg:blue2 mr:1 t:xs blue7 l:flex center

```

As mentioned before - there isn't really a difference between templating syntax and other code in Imba. Tag trees are just code, so logic and control flow statements work as you would expect. To render lists of items you simply write a `for` loop where you want the children to be:

```imba
# Render first 10 movies in array
<div.list> for movie,i in movies when i < 10
    <div.item> movie.title
```

You can use break, continue and anything else you would expect to work. Here is a more advanced example

```imba
<div.list> for movie,i in movies
    if i % 10 == 0
        # Add a heading for every 10th item
        <div.heading> "Ranked {i + 1} to {i + 10}"
    <div.item>
        <span.number> i + 1
        <span.title> movie.title
    
    break if movie.title == 'The Usual Suspects'
```

## Basic lists

## Keyed Lists

# Handling Events

[Article](/articles/events.md)

# Form Input Bindings

[Article](/articles/binding-data.md)

# Using Slots

Sometimes you want to allow taking in elements from the outside and render them somewhere inside the tree of your component. `<slot>` is a placeholder for the content being passed in from the outside.

##### Basic slot
```imba
tag app-option
    <self>
        <input type="checkbox">
        <label> ~[<slot>]~

<app-option>
    ~[<b> "Option name"
    <span> "Description for this option"]~
```

Anything inside the `<slot>` will be shown if no content is supplied from outside.

```imba
tag app-option
    <self>
        <input type="checkbox">
        <label> ~[<slot> "Unnamed option"]~
<app-option>
```
You can also add named slots using `<slot name=...>` and render into them using `<el for=slotname>` in the outer rendering.
```imba
css app-panel
	d:block m:3 b:gray2 t:sm
	& header = p:1 bg:gray3
	& main = p:3 t:md
	& footer = p:1 bg:gray1

# ---
tag app-panel
    <self>
        <header> ~[<slot name="header"> "Panel"]~
        <main> ~[<slot> <p> "Nothing here"]~
        <footer> ~[<slot name="footer"> "Footer"]~

imba.mount do <div> <app-panel>
    ~[<div for="header"> "Custom header"
    <div> "Something in main slot"
    <div> "More in main slot"]~
```

# Named Elements

It can be useful to keep references to certain child elements inside a component. This can be done using `<node$reference>` syntax.
```imba
tag app-panel
    <self> <input~hl[$name]~ type='text'>
```
In the code above, `$name` will be available everywhere inside `app-panel` component.
```imba
tag app-panel
    def write
        $name.value = 'something'

    <self>
        <input$name type='text'>
        <button @click=write> "write"
```

It can also be accessed from outside `app-panel` as a property
```imba
tag app-panel
    <self> <input$name type='text'>

let app = <app-panel>
console.log ~[app.$name]~
```






# Lifecycle Hooks

[Article](/articles/lifecycle.md)
