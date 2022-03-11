---
id: eif9tghj1s6iqkfik1m2jzo
title: 1 Welcome to Imbaio
desc: ''
updated: 1646819388338
created: 1646819388338
tags:
  - article
url: 'https://github.com/imba/imba.io/issues/1'
status: CLOSED
issueID: MDU6SXNzdWUxMjM5NzQ0MTA=
author: 'https://github.com/somebee'
---
We've finally launched a decent site with documentation and guides. Up until now, it has been very difficult to learn Imba, even if you were really interested. We still have a long road ahead, but at least
we have docs, guides, and examples to lead the way.
## Dogfooding

The whole site is written in Imba, and uses the same code on server and client (including rendering and routing). All navigation after initial page-load happens through the [history API](https://developer.mozilla.org/en-US/docs/Web/API/History_API) rendered locally on the client, while any full reload should return the same page from the server. This is a great benefit of using the same code in both environments. The source can be found at [somebee/imba.io](http://github.com/somebee/imba.io). Even though it is still quite messy and the comments are few and far between, it is a good example of how to structure a site / project of decent size in imba.
## Scrimbla

Every snippet on the site is editable, and runnable, thanks to a brand new web-based code editor written in Imba. It still has _many_ quirks and issues, but it already includes some cool features, like live error 
reporting, both compile-time errors and runtime errors (with proper sourcemapping). The long-term plan is to make Scrimbla the goto editor for coding imba, but for now it is only used for these tiny snippets around here.

``` imba
var msg = "I am editable"
```

> The editor is **very** experimental. Expect crashes, quirks, and tons of weird issues. When you do, please [file an issue](https://github.com/somebee/scrimbla/issues) over at [somebee/scrimbla](https://github.com/somebee/scrimbla).
## Going forward

The documentation is still lacking, and the ecosystem is in its early days. We are working on a more usable playground for testing 

We'd love for you to try it out. If you run into any trouble, make sure to [file an issue](http://github.com/somebee/imba/issues) or contact us on [gitter](https://gitter.im/somebee/imba). We'll do everything we can to help you out! Happy coding!
