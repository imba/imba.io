---
title: Imba Router
order: 4
---

# Imba Router

Tek Sayfa Uygulamaların çoğunda,[imba-router](https://github.com/somebee/imba-router) kütüphanesinin kullanılması önerilir. Bu [6 bölümlük etkileşimli ekran görüntüsünü](https://scrimba.com/playlist/pMvYcg) inceleyin.

```text
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

