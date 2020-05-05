---
title: DOM
multipage: true
---

# HTML Tags

HTML tags are these: `<div></div>`. Have you seen those before? We hope so. We will be using those in Imba, so incase you need to be more familiar with them, here's a good list with explanations from [Mozilla](https://developer.mozilla.org/en-US/docs/Web/HTML/Element)

Imba virtually supports all HTML elements with exception of of their closing tags. You don't need these anymore. `</div>`

## Syntax Changes
Imba uses indentation for nesting, so say goodbye to tag chiasms.

Let's convert a few tags over to imba syntax. Take this for example.
```imba
<html>
    <body>
        <header>
            <h1> Hello World! </h1>
        </header>
    <body>
</html>
```
In Imba it would look like this.
```imba
<html>
	<body>
		<header>
			<h1> "Hello World!"
```
Notice that the text is wrapped in quotes. In Imba, data types are treated as it would in Javascript. So a string of text must be wrapped in double or single quotes.
## HTML Properties
HTML properties work just as they would in vanilla HTML with the exception of classes and id's.
```Imba
<p width="200> "This is a paragraph with a defined width"
```
Since classes and id's are commonly used, Imba has a special syntax for that.

[Learn about Classes and IDs]()

# HTML Classes and IDs
## Syntax Changes
Classes and ID's are the most commonly used html properties, therefore Imba makes that easier by allowing you to use the familiar CSS selector syntax for classes and ID's right within your html elements.
```
// HTML
<h1 id="page-title" class="primary"> Hello World! </h1>
//
<h1#page-title.primary> "Hello World!
```
## Dynamic Classes
Imba brings the power of dynamic data into Class and ID declarations.
```imba
var state = "active"
<a.{state}> "Home"
```
You could also combine dynamic data with a static parts in your classes.
```imba
<a.menu-link__{state}>
```
Curly braces is simply how you interpolate dynamic values into strings and properties within your html or imba tags.

## Conditional classes
Sometimes you'd like to change the class of an DOM element based on a boolean value. No need to do the whole `Document.selectElementByID` thing anymore. Watch how easy it is.
```Imba
var state = true
<a .active=state>
```
If the state evaluates to true, the class will be applied. If it isn't, then forget about it, it won't be compiled.