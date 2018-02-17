# Rendering

## The Wholy Grail

Most frameworks for developing web applications try to solve one thing; update views automatically when the underlying data changes. Imba solves this too, but not in the regular way. Imba uses a different approach. As you've learned, to allow your views to be dynamic, you either need to create custom tags, or make the content of your toplevel tags dynamic.

```imba
# the content of div will never change
Imba.mount <div> <h1> "Random: {Math.random}"

# the content of div will update automatically
Imba.mount <div -> <h1> "Random: {Math.random}"
```

## The Imba Way

You can choose to render manually or integrate with mobx (or another data-layer). But the default in Imba is more than good enough for most cases. When you mount a tag in Imba, using `Imba.mount`, the node is scheduled to render after every captured dom event. This might sound slow, but the truth is that Imba is *much* faster than other frameworks. At [scrimba.com](https://scrimba.com), which is a complex site, we still use this approach. How can we render OUR WHOLE APP after a user has tapped a single button? The way Imba brings the views in sync is in most cases much faster than tracking what has changed and what to render.

* No need for complex frameworks to track changes and dependencies
* No need to drink immutability cool-aid (to help the vdom perform)
* Very fast, very memory efficient

Even though practically all changes to the state of your application will happen as a result of user interactions, there are still a few places you need to notify Imba that things have changed. E.g. if you receive data from a socket/server, you want to call `Imba.commit` at the appropriate places. Don't be afraid to call it too often though, so for websockets it should be as easy as setting up `socket.addEventListener('message',Imba:commit)` when initializing the socket.