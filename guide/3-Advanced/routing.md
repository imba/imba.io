---
title: Imba Router
order: 3
---


# Imba Router

For most Single Page Applications, it’s recommended to use the [imba-router](https://github.com/somebee/imba-router) library. Check out this [6-part interactive screencast](https://scrimba.com/playlist/pMvYcg).

```imba
require 'imba-router'

tag Home
    def render
        <self> "Home"

tag About
    def render
        <self> "About"

tag App
    def render
        <self>
            <header>
                <a route-to='/home'> "Home"
                <a route-to='/about'> "About"
            <Home route='/home'> 
            <About route='/about'>

```



