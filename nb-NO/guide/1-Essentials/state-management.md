---
title: State Management
order: 7
---

# State Management

Most frameworks for developing web applications try to solve one thing well; update views automatically when the underlying data changes. Imba is unoppinionated about state management.

Imba does dom reconciliation in a completely new way, which is more than [20 times faster](https://somebee.github.io/dom-reconciler-bench/index.html) than other approaches. Because of this we really don't need to think about state management. There is no need for observable objects, immutable data-structures etc.

This probably sounds naive, but it is true. Even in a complex platform like [scrimba.com](https://scrimba.com) we don't use any state-management framework at all. Our data is not observable. We simply re-render the whole application all the time. It just works.

> The virtual DOM has been optimized by Vue, React, and others for years. How could this possibly be 20 times faster? Imba uses a very different approach, where we essentially compile your **declarative views** down to a very optimized **inline cached dom**.

### Using MobX, Redux, Apollo, Relay, ...

You are free to use whatever state management framework you want, just know that if your only reason for using them is to make sure your view is automatically updated alongside your data, **you don't need them**. The only requirement is that you mount your root view using `Imba.mount`.

```imba
# a plain object containing state?!
var state = {x: 0, y: 0, title: "Something"}

tag App
    def onmousemove e
        state:x = e.x
        state:y = e.y

    def render
        <self>
            <h1> "Mouse is at {state:x or 0} {state:y or 0}"
            if state:x > 350
                <h2> "X is over 350!"

Imba.mount <App>
```


### But, my view isn't updating?!

The default approach of Imba is to re-render the mounted application after every handled DOM event. If a handler is asynchronous (using async/await or returning a promise), Imba will also re-render after this promise is finished. Practically all state changes in applications happen as a result of some user interaction. For the few other cases, we can call `Imba.commit` manually.

#### Receiving data through a WebSocket

If you update state based on data received through a socket you will need to notify Imba that something might have changed. The easiest way to do this is to simply:

```imba
# Call Imba.commit after every message from socket
mySocket.addEventListener('message') do Imba.commit
```

#### Receiving data through fetch

If you are receiving data through xmlhttprequest/window.fetch, you should call Imba.commit after the request is finished. If you do this a lot you should probably just create a fetch-wrapper that automatically calls Imba.commit.

```imba
def load
    var res = await window.fetch("/items")
    var data = await res.json
    MyState:items = data
    # just notify Imba that it should reschedule items
    Imba.commit

```

