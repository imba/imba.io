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

# Tag Props (Custom Properties)
## What are props?
Instance Variables
<!-- TODO WIP -->
## Syntax
<!-- TODO: See Tag Property Data -->
<!-- TODO: See Parent Tag Property Data (Context) here-->
<!-- https://app.gitbook.com/@imba/s/guide/dom/tags-components -->
## Tag Property Data
In the example below we render the app-pages component once for each object in the `pages` array variable. We then dynamically pass the corresponding object data to the component with `p=page`. We then dynamically access the title from the app-pages component by using the `p.title` prop.

<!-- TODO: Explain Example Better -->

```imba
let pages = [
	title: "Home"
	description: "This is the home page"
	---
	title: "About"
	description: "This is the about page"
]
tag app-root
	def render
		<self>
			<h1> "Hello World"
			for page in pages
				<app-pages p=page >
tag app-pages
	def render
		<self>
			<h1> @p.title
```

## Parent Tag Property Data (Context)
If we would like to use data from a prop assigned to a parent component we cannot access it by simply stating the prop name.

We could if we passed the prop value to the child through a new prop like this: `p=p` , but we do not need to that.

In imba we can use $context.propertyName to traverse up the component tree, and it will return the value of the first matching property on any parent element.

<!-- TODO: Explain example -->

```imba
let pages = [
	title: "Home"
	description: "This is the home page"
	---
	title: "About"
	description: "This is the about page"
]
tag app-root
	def render
		<self>
			<h1> "Hello World"
			for page in pages
				<app-pages page=page desc=page.description>
tag app-pages
	def render
		<self>
			<h1> @page.title
			<app-content>
tag app-content
	def render
		<self>
			<p> #context.desc
```
