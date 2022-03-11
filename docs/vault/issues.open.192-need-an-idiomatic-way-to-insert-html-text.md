---
id: dx7cko8td2ongm6x5unbf6c
title: 192 Need an Idiomatic Way to Insert HTML Text
desc: ''
updated: 1646819629240
created: 1646819629240
url: 'https://github.com/imba/imba.io/issues/192'
status: OPEN
issueID: MDU6SXNzdWU5MjQxNjU5NjQ=
author: 'https://github.com/lacikawiz'
---
Currently, the variables and string constants are inserted using the `innerText` property. This causes HTML encoded elements like `&nbsp;` or `&raquo` to show up as the code, and not as a space or » character. 

There's a hacky way to make that happen using the `innerHTML` property, like this:
`<th innerHTML="&raquo;">` 

However, this is not in the documentation and is more of a workaround than a standard way of doing it.

It also does not offer a way to insert the HTML without adding another level to the DOM tree. 

There should be a way to insert HTML from a variable or expression without adding an extra element. 

For example something like this:
```
// this can be coming from an API call
let price= "<del>$11.95</del><ins>$9.99</ins>"  
<div>
  "Price: ", HTML price
  <button> "Add to Cart
```
Where `HTML` would be a special function or construct to add the content of the `price` as HTML.
