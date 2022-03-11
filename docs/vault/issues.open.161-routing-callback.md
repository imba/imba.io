---
id: hs1nzrvj1th5xguz14cngs7
title: 161 Routing Callback
desc: ''
updated: 1646819629241
created: 1646819629241
url: 'https://github.com/imba/imba.io/issues/161'
status: OPEN
issueID: MDU6SXNzdWU3MzgwMjM4NDM=
author: 'https://github.com/trafnar'
---
In order to make the documentation menu animate correctly, I think I need to know when a new route is being navigated to. Is there a way to trigger an event in this case that can be responded to by the other nav items?

Here's what happens:

- when a section is expanded, the height of the child section is calculated so that it can be animated to (CSS won't animate to 'auto' height).
- when the animation is finished, I will set it back to 'auto' in order to accommodate changes inside it which change its height.
- when _another_ menu item is navigated to, that may cause the current section to collapse, which means the height needs to be set back to a number, instead of `auto` but I don't know how to hook up an event in that scenario. 
