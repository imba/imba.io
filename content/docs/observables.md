# Observables

> [tip box yellow] Language-level integration of mobx was added in v2.0.0-alpha.202 and is still experimental.

There is no need to use a state management library to help Imba re-render only the parts of your application that have changed. But if you are accessing expensive computed properties inside of render, or want to run certain functions whenever your app is in a certain state, you may consider using one of the main state management libraries that exists.

To make the choice easy for you, Imba has baked-in support for [mobx](https://mobx.js.org/), arguably the best state management library in the JS ecosystem. Since Imba integrates mobx at the language-level it even supports features of mobx that are not possible in plain JS, like observable subclasses and autorunning methods that automatically dispose.

Mobx and related features are tree-shaken out of your built imba projects when they are not used.

Mobx v6 moved away from recommending decorators due to ever changing proposals and transpilers. In Imba you can implement all the observables using decorators.

## Potential use-cases


> Focus on the actual usecases where this is relevant

> Example filtering

## imba.autorun

The main usecase for observables in Imba is _not_ for rendering. 

```imba
# [preview=md]
import {genres,movies} from 'imdb'

tag App
    @observable query = ''
    hits = movies
    # this is run when any observed property
    # referenced in this method is changed
    @autorun def refresh
        console.log "autorunning"
        let all = movies
        if query
            let regex = new RegExp(query.split("").join(".*?"),"i")
            all = all.filter do regex.test($1.title)
        self.hits = all

    <self>
        <input bind=query>
        <div>
            <h2> "Results:"
            <ul> for item in hits
                <li> item.title

imba.mount <App>
```

You can pass the options into the decorators
