# Using Router

Imba comes with a built-in router that works on both client and server. It requires no setup and merely introduces the [route](api://Element.route) and [route-to](api://Element.route-to) properties on elements. The router for your 
application is always available via [imba.router](api://imba.router).

```imba app.imba
# [preview=lg] [titlebar] [route=/home]
import './styles.imba'
import './about.imba'

tag App
    <self>
        <nav>
            <a route-to='/home'> "Home"
            <a route-to='/about'> "About"
            <a href='/more'> "More"

        <div route='/home'> "Welcome"
        <about-page route='/about'>
        <div route='/more'> "More..."

imba.mount <App.app>
```

```imba about.imba
tag about-page < main
    <self>
        <aside>
            <a route-to="team"> "Team"
            <a route-to="contact"> "Contact"
        <section>
            <div route=''> "Stuff about us. Click the links to the right"
            <div route='team'> "Our team"
            <div route='contact'> "Contact us at"
```

```imba styles.imba
import 'util/styles'
# ---
global css @root
    # links using route-to gets an .active flag when the
    # route is matching
    a.active td:none c:gray8
    aside fl:0 0 120px d:vflex j:flex-start px:2 bdr:gray3 fs:sm
    main d:hflex ac:stretch
    section fl:1
```

As you can see with the `More` link, regular links with `href` attributes will also be intercepted by the router. The difference is that [route-to](api://Element.route-to) adds some powerful features like nested routes (see below), and [route-to](api://Element.route-to) will automatically add an `active` class to the element whenever the route it links to is matching.

## Route matching

When using [route](api://Element.route) to determine when components should render, the string you pass to route is a regex pattern which will be tested against the current route. Thus if you have multiple components that match part of the request path, they will all render, as shown in this example:

```imba matching.imba
tag app
	<self>
		<nav>
			<a route-to="/"> "Home Page"
			<a route-to="/test"> "Test Page"
			<a route-to="/test/inner"> "Inner Page"
		
		<home route="/"> # this will render on /, /test, and /test/inner
		<test route="/test"> # this will renderon /test and /test/inner
		<inner route="/test/inner"> # this will render on /test/inner
```

If you want these to be _exact matches_ only, then you should use `$` at the end of the path, as shown below. This is true for both the [route-to](api://Element.route-to) and [route](api://Element.route) calls:

```imba exact-matching.imba
tag app
	<self>
		<nav>
			<a route-to="/$"> "Home Page"
			<a route-to="/test$"> "Test Page"
			<a route-to="/test/inner$"> "Inner Page"
		
		<home route="/$"> # this will only render on /
		<test route="/test$"> # this will only render on /test
		<inner route="/test/inner$"> # this will only render on /test/inner
```

## Nested Routes

Routes that do not start with `/` will be treated as nested routes, and resolve relative to the closest parent route. This works for both [route](api://Element.route) and [route-to](api://Element.route-to).

## Dynamic Routes

To map a url pattern to a component, you can use dynamic segments in your routes. A dynamic segment starts with `:`. So the pattern `/user/:id` with match `/user/1`, `/user/2` etc. You can have multiple dynamic segments in a route, like `/genre/:id/movies/:page`. All segments map to corresponding fields in `route.params`. When using nested routes, even the params from parent routes will be available in `route.params`.

```imba app.imba
# [preview=lg] [titlebar] [route=/genre/drama]
import 'util/styles'
# ---
import {genres} from 'imdb'

tag Genre
    <self> "Genre with id {route.params.id}"

tag App
    <self>
        # render links for all genres
        <nav> for item in genres.top
            <a route-to="/genre/{item.id}"> item.title
        <Genre.page route="/genre/:id">
# ---
imba.mount <App.app>
```

## Loading Data

In the example above, the same `<Genre>` component is used when switching between genres. As you can see, the `id` segment from the route is available via `route.params.id`, and it changes when we switch between genres.

If you want to do something when the params change you can define a `routed` method on your component. This will be called whenever the route changes, and supply the new params, and a state object that is unique for each matched route, but consistent over time (ie. when navigating back to a previously matched set of params).

If you load anything asynchronously inside `routed` (using `await`), the component will delay rendering until `routed` has finished.

A nice feature of the imba router is that the `params` of any particular route match are constant. Matching `/genre/:id` with the url `/genre/action` it will always return the same `params` object! This is useful for memoizing data etc. (More documentations and examples of usecases will come before final release)

In addition to this, `route.state` will always return an object that is unique *per match*, but consistent over time. This is very useful for caching data etc for a `component<->matching-route` combination.

```imba app.imba
# [preview=lg] [titlebar] [route=/genre/drama]
import 'util/styles'
# ---
import {genres} from 'imdb'

tag Genre
    def routed params, state
        console.log 'routed',params
        data = state.genre ||= await genres.fetch(params.id)

    <self[d:vflex o@suspended:0.4]>
        <div> "{data.title} has {data.movies.length} movies in top 250"
# ---
tag App
    <self>
        <nav> for item in genres.top
            <a route-to="/genre/{item.id}"> item.title
        <Genre.page route="/genre/:id">
imba.mount <App.app>
```
As you can see in the example above, we cache data in the `state` object supplied to `routed`. This will make sure you don't refetch the data when you click on a genre you've seen before.