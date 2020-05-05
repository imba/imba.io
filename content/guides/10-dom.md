---
title: DOM
multipage: true
---
# HTML Elements
## Syntax Changes
Imba virtually supports all HTML elements, without their closing tags. Yeah, you don't need those anymore. Imba uses indentation for nesting, so say goodbye to tag wrapping. Once you go indented, you can never go back.

Let's convert an html paragraph to Imba syntax.
```imba
<p> This is a pragraph </p>
```
In Imba it would look like this.
```imba
<p> "this is a paragraph"
```
Notice that the text is wrapped in quotes. In Imba, data types are treated as it would in Javascript. So a string of text must be wrapped in double or single quotes.
## HTML Properties
HTML properties work just as they would in vanilla HTML with the exception of classes and id's.
```Imba
<p width="200> "This is a paragraph with a defined width"
```
Since classes and id's are commonly used, Imba has a special syntax for that.

[Learn about Classes and IDs]()