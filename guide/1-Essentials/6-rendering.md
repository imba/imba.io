---
title: Rendering
order: 7
---

# Reactive Rendering

Most frameworks for developing web applications try to solve one thing well; update views automatically when the underlying data changes. 

Imba takes the default approach of updating the view whenever *something* *might* have changed. The performance of bringing the dom in sync with your declared view is so ridiculously fast in Imba, that introducing complex data-stores with observers tracking which parts depends on what data etc is not needed.


## Scheduling

When you mount a tag in Imba, using `Imba.mount`, the node is scheduled to render after every captured dom event. This might sound slow, but the truth is that Imba is *much* faster than other frameworks.

#### Default scheduling

```imba
var counter = 0
var status = "Hello"

tag App
    def doSomething
        self

    def loadAsync
        status = "loading"
        setTimeout(&,500) do
            status = "loaded"
            # Call Imba.commit to let Imba
            # render scheduled nodes
            Imba.commit

    def render
        <self.bar>
            <button> "noop"
            <button :tap.doSomething> "handle" 
            <button :tap.loadAsync> "async"
            <div> "Rendered: {++counter}"
            <div> "Status: {status}"

# when mounting a node with Imba.mount it will automatically
# be scheduled to render after dom events and Imba.commit
Imba.mount <App>
```

Even though most changes to the state of your application will happen as a result of user interactions, there are still a few places you need to notify Imba that things have changed. E.g. if you receive data from a socket you want to call `Imba.commit` after receiving messages `socket.addEventListener('message',Imba:commit)`, and if you are fetching data from a server outside of event handlers, you want to call Imba.commit at the end of the fetch.


#### Rendering at intervals

```imba
tag Clock
    def mount
        schedule(interval: 1000)

    def render
        <self> Date.new.toLocaleString

Imba.mount <Clock>
```

#### Rendering every frame

```imba
tag App
    def mount
        schedule(raf: true)

    def onmousemove e
        @x = e.x
        @y = e.y

    def render
        <self.bar>
            <div> "Mouse is at {@x or 0} {@y or 0}"


Imba.mount <App>
```
