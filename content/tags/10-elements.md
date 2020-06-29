---
title: Elements
---

# Elements

Imba treats DOM elements first-class citizens, on a much deeper level than JSX. Imba does not use a virtual dom but compiles declarative tag trees into an incredibly efficient [memoized dom](https://medium.com/free-code-camp/the-virtual-dom-is-slow-meet-the-memoized-dom-bb19f546cc52), which is orders of magnitute faster than vdom approaches, yet conceptually simpler.


## Literals

```imba
# Creating a literal dom element:
let div = <div#main.note.sticky title='Welcome'>
# is essentially equivalent to:
let div = document.createElement('div')
div.id = 'main'
div.classList.add('note')
div.classList.add('sticky')
div.setAttribute('title','Welcome')
```

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
