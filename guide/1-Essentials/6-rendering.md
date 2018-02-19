# Rendering

Most frameworks for developing web applications try to solve one thing; update views automatically when the underlying data changes. Imba takes the approach of updating the view whenever *something* *might* have changed. The performance of bringing the dom in sync with your declared view is so ridiculously fast in Imba, that introducing complex data-stores with observers tracking which parts depends on what data etc is not needed.

If you are a beginner, the only thing you really need to know for now is that you should always mount your root tag with `Imba.mount`, and let Imba take care of the rest.

```imba
tag App
    def render
        <self>
            <header> "Application"
            # nested components etc

Imba.mount <App> # don't you worry 'bout a thing
```

When you mount a tag in Imba, using `Imba.mount`, the node is scheduled to render after every captured dom event. This might sound slow, but the truth is that Imba is *much* faster than other frameworks. At [scrimba.com](https://scrimba.com), which is a complex site, we still use this approach. How can we render *our whole app* after a user has tapped a single button? The way Imba brings the views in sync is in most cases much faster than tracking what has changed and what to render.

### Calling Imba.commit

Even though most changes to the state of your application will happen as a result of user interactions, there are still a few places you need to notify Imba that things have changed. E.g. if you receive data from a socket/server, you want to call `Imba.commit` at the appropriate places. Don't be afraid to call it too often though, so for websockets it should be as easy as setting up `socket.addEventListener('message',Imba:commit)` when initializing the socket.

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

Imba.mount <App>
```


### Manual scheduling

You can also schedule nodes to render on every frame, or render at a specific interval. Here we are doing both in different elements:

```imba
tag Clock
    def mount
        # render every 1000ms
        schedule(interval: 1000)

    def render
        <self> Date.new.toLocaleString

tag Counter
    def setup
        @ticks = 0

    def render
        <self.bar>
            <button :tap.schedule(raf: true)> "Start"
            <button :tap.unschedule> "Stop"
            <span> @ticks++

tag App
    def setup
        @renderCount = 0

    def mount
        schedule(events: true)

    def render
        <self>
            <div> "Rendered {++@renderCount} times"
            <Clock>
            <Counter>

Imba.mount <App>
```


### Integrating with MobX

Example coming



