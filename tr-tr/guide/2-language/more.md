---
title: Await
order: 7
---

# Await

Imba supports the `await` keyword, which compiles directly to async/await in JavaScript. The only difference is that you do not need to mark your functions as async. Any function that contains an await will automatically be compiled to an async function.

## await

```text
def load url
    var res = await window.fetch url
    return res.json

var data = await load "/some/url"
```

## Without await

```text
def load url
    window.fetch(url).then do |res|
        return res.json

load("/some/url").then do |data|
    # do something with data
```

> async/await is already supported in every major browser. If you are targeting IE11 users you need to babelify the compiled code.

