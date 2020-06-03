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


# Mounting

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

As long as you have mounted your root element using `imba.mount` you shouldn't need to care about making sure elements are updated to reflect state changes. The default approach of Imba is to re-render the mounted application after every handled DOM event. If a handler is asynchronous (using async/await or returning a promise), Imba will also re-render after this promise is finished. Practically all state changes in applications happen as a result of some user interaction.

# Updating

As long as you have mounted your root element using `imba.mount` you shouldn't need to care about making sure elements are updated to reflect state changes. The default approach of Imba is to re-render the mounted application after every handled DOM event. If a handler is asynchronous (using async/await or returning a promise), Imba will also re-render after this promise is finished. Practically all state changes in applications happen as a result of some user interaction.

## imba.commit

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

## State Management

You are free to use whatever state management framework you want, just know that if your only reason for using them is to make sure your view is automatically updated alongside your data, you don't need them. The only requirement is that you mount your root view using `imba.mount`.

Of course, there is one caveat. Imba is insanely fast at reconciling the dom with the state of your application, but if you do heavy computation directly within the rendering loop - you should rather use something like mobx to ensure that these computations happen only when they need to.
