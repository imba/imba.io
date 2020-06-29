---
title: Templating
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
<p width="200"> "This is a paragraph with a defined width"
```

Since classes and id's are commonly used, Imba has a special syntax for that.

<!-- TODO: Link to the next page -->
[Learn about Classes and IDs]()

# HTML Classes and IDs
## Syntax Changes
Classes and ID's are the most commonly used html properties, therefore Imba makes that easier by allowing you to use the familiar CSS selector syntax for classes and ID's right within your html elements.

```imba
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


<!-- TODO: Link to the next page -->
[Learn about Tag (Components)]()
# Tags (Components)

> From now on, when you read the word **Tag** by itself, we will be referring to Imba custom components, not HTML tags. We will be specific when we mean HTML tags or any other kind of tag.

Modern Web Development has become quite comlex and web applications are no longer built and maintained with three documents (html, css, js). Modern web apps are broken down into smaller building blocks called components to make the development process more enjoyable and bring sanity to the maintenance process.

Since we know that a component based architecture is essential to modern web development, Imba has built this right into the language.

Imba's components (v2) are compiled to web-components, which comes with a few native behaviors and naming conventions that we'll need to be aware of, but don't worry, we'll go over those.

## Creating a Tag

To create a Tag, use the keyword `tag` followed by a component name according to web-component's custom component naming convention. It must contain at least two words separated by a dash.

```imba
tag app-root
	...
imba.mount <app-root>
```

Any dom elements that you would like to see rendered on every instance of that tag need to be declared within the the `<self>` tag within the `def render` method.

```imba
tag app-root
	def render
		<self> 
			<h1> "hello world"
```
Anything within the render method will be rendered to the dom, and updated upon any event.

If you have no other methods to declare in your component you may omit the `def render` method to save space. Imba will wrap your <self> tag with the `def render` method behind the scenes.
```imba
tag app-root
	<self> // You can omit the `def render` method since there are no other methods.
		<h1> "hello world

```
## Nested Components
You may have multiple tags in one document, and render them within the other tags in the document.

```imba
tag app-header
	def render
		<self>
			<h1> "Hello World!"
tag app-root
	def render
		<self>
			<app-header>
```

You may create multiple tags in a single document or in separate documents and import them as modules.

```imba
import `app-header` from './components/app-header.imba'
tag app-root
	def render
		<self>
			<app-header>
```

## Dynamic Tag Attributes
You may use attributes as you would in HTML. Just remember to omit quotes for dynamic values. In the example, we are adding the image source dynamically from a variable.

```imba
let image = "images/200.png"
tag my-app
	def render
		<self>
			<img src=image alt="placeholder">
```

## Dynamic Content (to the DOM)
Values from variables or any objects can be injected right into the DOM. Just place the name of the variable right inside the `<self>` tag or any other HTML tag. 

```imba
let name = "Imba"
tag my-app
	def render
		<self>
			<h1> name
```

You can also concatenate dynamic content with strings. Here are two ways to do that.

```imba
let name = "Imba"
tag my-app
	def render
		<self>
			<h1> "{name} is awesome!"
			<h1> name + " is awesome!"
```

The `name` variable is no more than Javscript object.
That means that you can use any Javascript built-in methods on Imba objects.

The `name` object contains a string value `"Imba"`, so we can use the `.toUpperCase()` method from the string prototype, and since we're not passing any arguments, we can use Imba's fun syntax `.toUpperCase!`.

```imba
let name = "World"
tag my-app
	def render
		<self>
			<h1> "Hello {name.toUpperCase!}!"
			# or
			<h1> "Hello" + name.toUpperCase! + "!"
```
[Here's a list of js methods at your disposal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects)

## Functional Tags
<!-- TODO Explain -->
```imba
if bool
	functional-tag(@page.items[0])

def functional-tag item
	<div> <page-item item=item>
```

<!-- TODO: Link to the next page -->
[Learn about Tag Props]()

# Tag Props
## What are props?
Components are better when they can share data with other parent or child components. Props (short for properties) allow you to do just that. Props are fundamentally ready-to-go variables of an instance of an object.

## How to create a prop
Imba has a special keyword called "prop" to create props, and props are declared at the root level of a tag using the following syntax: `prop PROPNAME = 'default value'`

Here is a practical example.

```imba
tag app-page
	prop pagename = "Home Page"
```
## How to use a prop
We can now render the value of the language prop into our `<h1>` by simply placing the prop name within any element.
```imba
tag app-page
	prop pagename = "Home Page"
	def render
		<self>
			<h1> pagename
```
The above will render the following header `<h1> Home Page </h1>` in the html.

## Passing dynamic values to a prop

Another way to create a prop is from the instance of a tag. You don't have to declare it in the tag itself, unless you need a default value.
We can now easily pass data from the app-root tag, to the home-page tag.

```imba
tag app-page
	prop pagename
	<self>
		<h1> pagename

tag app-root
	prop pages = [
		"Home Page"
		"About Page"
		"Contact Page"
	]
	<self>
		for page in pages
			<app-page pagename=page>
```
<!-- TODO: Ad link to for loops page later in sentence below. -->
We will explain the `for page in pages` loop later, but what is happening is that for every string inside the `prop pages` array in the `app-root` tag, we are going to render a `<home-page>` tag with the corresponding string from the array.

That will generate three instances of the app-page component, but each will have a different header. One will say "Home Page", the other "About Page", and the other "Contact Page"

## Interactive Prop Example
Now that we have uncovered the power behind props, let's see a more complicated example. Can you tell what this will do? Click **run** on the top right of the code box to play with the code.
```imba
tag likes-view
	prop likeCounter
	def render
		<self>
			<p> "Likes:" {<b> likeCounter}
let counter = 0
tag app-root
	def increase
		counter++
	def render
		<self>
			<button @click.increase!> "👍"
			<likes-view likeCounter=0>
```
`@click.increase!` is a method that is run upon the click event. Let's learn about methods.

<!-- TODO: Link to the next page -->

# [WIP] Tag Methods

# [WIP] Tag Ref

# [WIP] Tag Slots
## Default Slot
## Named Slots
## Magic Slots

# [WIP]  Tag Lifecycle

# [WIP] Tag Scheduler