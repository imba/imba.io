---
title: Scripting
multipage: true
---
# Data types
Imba is an indentation based language. If you have written any Ruby or Python then a lot of the syntax will feel familiar. Even though the syntax and semantics of Imba is much more related to Ruby than JavaScript, it does compile down to plain JavaScript, and is fully compatible with any existing JavaScript libraries. Imba does not extend any native types from JavaScript. Arrays are arrays, strings are strings, numbers are numbers, classes are constructors with prototypes and so forth.

## Interoperability
ll the fundamental types are the same as in JavaScript, so for documentation about available methods see MDN Object, Function, String, Number, RegExp, Array, Date, Math

## Strings
```imba
var single = 'single quotes'
var double = "double quotes"
var interpolation = "string has {double}"
```
## Numbers
```imba
var integer = 42
var float = 42.10
```

# Variables
The Imba variable types are the same as the Javascript variable types.
```imba
let user	# can be updated but not re-declared
var date	# can be updated and re-declared within its scope
const site	# can neither be updated nor re-declared
```
### Assign values to Variables
```imba
# Assigning values
let user = 'Eric' # string
let age = 25 # number
let loggedIn = yes|no|true|false # boolean

# Other Value Types
let email # undefined - value not assigned
image # TypeError
```
# Objects
## Object Literal Syntax
In Javascript objects are created with curly braces. That syntax is supported in Imba, but you may also omit the curly braces and commas. Imba will figure out it all out when you use proper indentation.
##### Syntax
```imba
var objectName = {
	keyName: "value",
	keyName: "value",
}
# or 
var objectName =
	keyName: "value"
	keyName: "value"
```
Here's a practical example.
```imba
var language =
	name: "imba"
	version: "2"
	launchDate: 2020
```
## Access Properties
You can access properties by the key names. Therea are two syntaxses for this, which can be appropriate for different scenarios.
##### Syntax
```imba
objectName.keyName
objectName["keyName"] // passing a string as a key selector
```
Example
```imba
// access property via dot notation
console.log language.name
// access property via string
console.log language['launchDate']
```
## Use Variables as keys
The second syntax for selecting keys `objectName['keyname']` is useful if you want to dynamically pass the key name to your object selector.
Example

```imba
# store key name in variable
let n = 'name'

# use variable instead of keyname
console.log(language[n])

```
## Mutate Object Data
Even if you have pre-declared property values on your object, you can still update their values later on, by passing the new data to the desired object with the following syntax: 
##### Syntax
```imba
object.property = 'new value'
```
Example
```imba
let language =
	name: 'js'

# mutates object data
langauge.name = 'imba'

# prints mutated object value instead of original value
console.log(language.name)
// > 'imba'
```
## Create New Objects
If you'd like to access data by the use of a name or key, you need to store that data in an object using key/value pairs. 
You will then be able to access the data as properties of that object. 
##### Syntax
```imba
let objectName = Object.new
```
Example
```imba
# Creates an object with the name chico.
let chico = Object.new

# Declare new properties and values to the chico object after it was created.
chico.name = 'Chico'
chico.lastName = 'Bu'
chico.birthYear = '2019'

# Print chico Object to the console.
console.log chico
// > Object { name: "Chico", lastName: "Bu", birthYear: "2019" }

```

If we wanted to declare the property values from the beginning, we could have done this instead. You can still mutate the data in the same manner as is described above.

```imba 
let chico =
	name: 'Chico'
	lastName: 'Bu'
	birthYear: '2019'

```
With arrays, order matters, but in objects, order doesn't matter much at all as keys will be accessed by their names and not their index value.

## Object Methods
An object can hold different types of data, arrays, and other objects, but we can also attach functions to objects. These functions are called methods.

Every object has some [native methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object), but we can also create our own methods.



##### Syntax
```imba
let objectName
	methodName: do
		2 * 4
```
With object methods can do calculations on the fly. This is useful for generating data from multiple objects at once based on unique property values of each. For example,
Example
```imba
let thisYear = 2020

let chico =
	firstName: "Chico"
	calculateAge: do
		let age = thisYear - 2019 // subtract 2019 (birthyear) from thisYear, and store in age variable.
		"Chico is {age} {if (age is 1) then "year" else "years"} old"

console.log chico.calculateAge! // Bang can be used instead of () if no arguments are passed
```
## Object Methods with Arguments
We can also pass an argument when we call the method. **For that, we need to create an argument key for our function block.**

##### Syntax
```imba
let objectName
	methodName: do(argumentKeyName)
		argumentKeyName * 4
console.log objectName.methodName(value)
```
Example
```imba
let thisYear = 2021

let chico =
	firstName: "Chico"
	calculateAge: do(today)
		let age = today - 2019  // subtract 2019 (birth year) from argument value
		"Chico is {age} {if (age is 1) then "year" else "years"} old"

console.log chico.calculateAge(thisYear)
```
<!-- TODO: I assume reader can modify the code at the end of the following paragraph. If they can't remove that sentence. -->
In the example above example we calculate the age of Chico Bu based on the current year. If his age is not 1, the sentence will say "years", if it is 1, then it will say "year". Try changing the date.

## Access own Property of Object
##### syntax
```imba
let objectName
	propertyKey: 2
	methodName: do
		this.propertyKey * 4

console.log objectName.methodName!
```
Let's keep improving our previous example. let's store the birth year in it's own property, and access Chico's name from the `firstName` property.
Example
```imba
let thisYear = 2021

let chico =
	firstName: "Chico"
	birthYear: 2019
	calculateAge: do(year)
		let age = year - this.birthYear  // subtract birthYear value from from `year` argument value
		"{this.firstName} is {age} {if (age is 1) then "year" else "years"} old"

console.log chico.calculateAge(thisYear)
```
## Setting Properties Within Methods
We can also set properties within anay method we have access to.
##### syntax
```imba
let objectname
	methodName: do
		objectname.newPropName = 'new prop value'
```
We can automatically generate a new age property with an up-to-date value by running the `calculateAge!` method. We will then be able to access the updated age each year via the same `.age` prop.
```imba
let chico =
	firstName: "Chico"
	birthYear: 2019
	calculateAge: do
		# set age property
		this.age = (Date.new).getFullYear() - this.birthYear
chico.calculateAge!
console.log chico.age 
// >> 1
```

# Arrays
## Creating Arrays
The Array class is a global object in javascript. The syntax for creating arrays doesn't differ from arrays in Javascript. This is an array in it's most basic form.
```imba
['html', 'css', 'js']
```
## Array Instance
Often, arrays are stored in variables to be accessible via that variable name. This is how we create an instance of an array.
```imba
let languages = ['html', 'css', 'js']
```
Everytime we call the languages variable, we are creating an instance of that array. 
```
let languages = new Array('html', 'css', 'js')
```
## Access Array values
Arrays are Zero indexed, which means that the first item in the array is the `0` item in the array.
so if we want to access. Can you guess what will print to the console if we access the `2` index in the `languages` variable?
```imba
let languages = new Array('html', 'css', 'js')
console.log languages[2] // > js
```
## Mutate Array
You can mutate the value of an array item, by assigning a new value to the desired array index.
The following will replace html for xml.
```imba
languages[0] = 'xml'
console.log languages // > [xml, css, js]
```
## Array Value Types
So far we have only used strings in our array, but we can use other javascript types.
```imba
var details = ['Imba', 2.0, 2020, 'language', true, {creator:"Sindre"}]
```
Here is a list of common javascript types used in arrays.
- undefined `[]`
- boolean `[true]`
- number `[1]`
- string `['hello']`
- object `[{lang: "imba"}]`
- function `[(do 2*2)]`
- null `array does not exist`

You can pretty much put anything in an array. Even other arrays, as they are objects as well.

## Array Properties
Any instance of an array will inherity from the Array prototype which comes with many handy built-in properties and methods such as the `length` property, which tells you how many items are in your array.
```imba
console.log languages.length // >> 3
```
## Array Methods
The Array prototype has many methods you can use on your array instances. A useful one is the `.push()` method. It can be used to add an item to the end of your array. Here we are adding 'Imba' to the languages array.
```imba
languages.push('Imba') // >> ['html', 'css', 'js', 'imba']
languages.length // >> 4
```
here are a few more useful array methods
```imba
let languages = ['html', 'css', 'js']
languages.indexOf('css') // >> 1
languages.pop() // removes last item of array: ['html', 'css']
languages.push('imba') // adds to end of array: ['html', 'css', 'imba']
languages.shift() // removes from beginning of array ['css','imba']
languages.unshift('imba') // adds to beginning of array ['imba' 'css', 'imba']
languages.splice(1,1, "imba") // replaces one item at index 1, with 'imba' >> ['imba','imba','imba']
```
[Here you can learn more about array methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array), but now you at least know how to replace all web languages with imba.

## Array of Objects
This is the normal way to do an array of objects.
```imba
let array [
	{
		key: 'value';
	},{
		key: 'value';
	},{
		key: 'value';
	}
]
```
Imba makes this a bit more fun and conscice with the following syntax.
##### Syntax
```imba
let array = [
	key: 'value'
	---
	key: 'value'
	---
	key: 'value'
]
```
Let's do a more practical example. Let's use a `for` loop to render each user in a users array, and render their name and hobbies to the dom. 

```imba
let users = [
	name: "eric"
	hobbies: [
		"coding"
		"music"
		]
	---
	name: "joe"
	hobbies: [
		"sports"
		"reading"
		]
	---
	name: "sally"
	hobbies: [
		"photography"
		"running"
		]
]
tag app-root
	def render
		<self>
			for object in array
				<h3> object.name
				<ul> for item in object.hobbies
					<li> item
```

<!-- ## Do Array Fun Project like checker board with array -->
# [WIP] Async / Await
# Comments
## Single line comments
There are two ways to do single line comments in imba
```Imba
// Javascript style

# Imba style
```
## Comment Blocks
There are also two ways to do multi-line comments
```imba
/* 
This is a javascript
style comment block (supported in Imba)
*/

###This is an Imba
style comment block
###
```
## HTML Comments
While in most cases Imba or JS comments should suffice, we have realized that some external libraries require to see HTML comments in the DOM for certain functionality, so we have included support fro HTML comments. Remember however, that Imba doesn't compile to HTML, it compiles to Javascript that will then inject HTML elements into the DOM when it is loaded on your app. That means that the comments will not appear until JS is loaded. At that point, your comments will appear in the DOM.
##### syntax
```imba
tag app-root
	<self> 
		// JS comments (not rendered to the dom)
		# Imba Comments (not rendered to the dom)
		<!-- html comments (rendered to the DOM) -->
		<h1> "hello world!"
```
# Classes
<!-- TODO: 
let Eric = Person.new
let Eric = new Person
Extending Class Constructors not supported?
 -->

> In JavaScript, classes are commonly referred to as a Constructor Functions or Prototypes.

A ***Class*** allows you to store a set of properties and methods under a keyword of your choice. 

Classes will make your codebase more maintainable and D.R.Y. by allowing you to create reusable prototypes (collections of props and methods) and instantiate them accross multiple objects. You can think of a ***prototype*** or ***class*** as a sort of blueprint for creating objects. 

For example, if you have multiple users that will contain an identical prototype that consists of a `name`, `phone` and `email`, they can all be instances of the same ***class***. 

In the future, if I want to add an `address` property to the user objects, I would only need to add it to the Class, and they will all inherit an `address` property. 


## Creating a class
A class is created with the `class` keyword followed by the desired `ClassName`.
##### syntax
```imba
class ClassName
```
> UpperCase is the conventional syntax for class names.
> 
<!-- TODO: Syntax might change from `ClassName.new` to `new ClassName` -->
You can then use the defined `ClassName` to create instances of that class with `.new`
##### syntax
```imba
var objectName = ClassName.new
```
Now we have a class ***instance*** stored in an object, the `objectName` object would now contain all the properties and methods of the ***Class*** from by default. The only problem, is that we have not declared any properties or methods within the `ClassName` class yet. Let's learn about that.

## Class Props & Methods
***Properties***, or ***Props*** for short, are variables of an instance of class. They cannot be accessed independently from the instance. They are declared with the `prop propName` syntax.
##### syntax
```imba
class ClassName
	prop propName = "prop value"
```
***Methods*** are no more than functions that are scoped to the instance of a class, so instance methods are declared in the same way as a function — with the `def methodName` syntax.
##### syntax
```imba
class ClassName
	def methodName
		console.log "method is called"
```
## Class Instance
***Intances of a Class*** are created using the `ClassName.new` and passing it as a value to an object.

##### syntax
```imba
var objectName = ClassName.new
```
## Accessing Class Props and Methods
After an instance is created, the ***properties*** and ***methods*** must be accessed via the object itself.

##### syntax
```imba
varName.propName
// > "prop value" // accessing prop

varName.methodName() // accessing method
// > "method is called"

varName.methodName! // if no arguments you can call a method like this.
// > "method is called"

```
For learning purposes, let's apply the syntax to a real example.
Let's create a class with a dynamic `prop` and a `method` that interacts with that prop.

Here we create a prop named "type" with the name of the class itself, which is "Person".

```imba
class Person
	prop type = this.constructor.name
	def tellType
		console.log type
```

An ***instance method*** is defined with the same synax as a function `def methodName`. Let's create a method called `tellType` and let's have it log the value of `type` to the console.
```imba
class Person
	prop type = this.constructor.name
	def tellType
		console.log type
```
The above class props and methods cannot be accessed unless we create an instance of it, so let's create an instance of person, and access the class name via our method.
```imba
class Person
	prop type = this.constructor.name
	def tellType
		console.log type
let eric = Person.new
eric.tellType()
// > Person
```
> **TIP** Methods, just like functions, are called using the `functionName()` syntax. If you don't have any parameters to pass, you can use an exclamation mark `!` instead of the parenthesis `()` . We think it looks prettier.

```imba
eric.tellType!
// > Person
```
## Constructors
Construtors are also known as initializer or prototype.
##### syntax
```imba
class ClassName
	def constructor argOne, argTwo, argThree
		propOne = argOne
		propTwo = argTwo
		propThree = argThree
```
This is the bread and butter of classes. When you have multiple objects that will use the same props and methods, you don't want to manually create those properties for each new object. Let's use these two objects as an example:
```imba
let eric =
	name: "Eric"
	age: 30
	job: "Developer"
let joe =
	name: "Joe"
	age: 20
	job: "Designer"
```
By making the Eric and Joe instances of the same Person class, when you add a new property to the Person class, it would become available to all instances. You don't need to add it to each one.
Here we're creating a class with the properties our objects will have.
```imba
class Person
	prop name
	prop age
	prop job
```

```imba
var eric = Person.new
var joe = Person.new
```
The above have the same three properties, but we don't want them to have the same three values. We need to pass values dynamically to each one, and that is done via arguments in the **constructor method**
```imba
class Person
	def constructor x, y, z
		name = x
		age = y
		job = z
```
> **TIP** You do not to declare the props before the constructor method if they are called in the constructor. Imba will create the props for you.

With arguments, we can now pass custom values to our props after creating our Person instance.
```imba
let eric = Person.new "Eric", "30", "Developer"
let joe = Person.new "Joe", "20", "Designer"
```
The values will be passed to our props dynamically. We can then access those values as props of our Eric & Joe Objects.
```imba
console.log eric.name
// > "Eric"
console.log joe.age
// > "Joe"
```

> **TIP** Imba also knows the difference between props and arguments within the cunstructor method, so you could use the same name if you wanted.
```imba
class Person
	def constructor name, age, job
		name = name
		age = age
		job = job
```
<!-- TODO: This might be redundant -->
### Methods are Functions
Don't forget that Methods, are simply functions within a Class. So anything you can do in a function, you can do in a method.
```imba
class Person
	def constructor name, age, job
		name = name
		age = age
		job = job
	def birthYear
		date = Date.new
		date.getFullYear! - age
let eric = Person.new "eric", 30, "teacher"
console.log eric.birthYear!
// > 1990
```
## Extending Class Constructors with `Super()`
<!-- TODO: NOT CURRENTLY SUPPORTED, OR NOT CORRECT SYNTAX -->
An important feature of Classes is the ability to inherit from other classes.

For example, an Athlete is also a person, so it makes sense to inherit the properties of a person so that if we ever update the person class, the Athlete's class will also be updated. It will also help us keep our code light.

```imba
class Person 
	def constructor name, age
		name = name
		age = age
class Athlete
	def constructor name, age, trophies
		name = name
		age = age
		trophies = trophies
```
Let's D.R.Y. our code a bit by inheriting the `name` and `age` props from the `Person` constructor.

We do so by defining our class `class Athlete` then using a `<` symbol followed by the class we want to inherit our prototype from. In this case `Person`.
```imba
class Athlete < Person
```
In order to call the Parent's constructor we need to use the super() method within our Athlete's constructor.
```imba
class Athlete < Person
	def constructor
		super!
```
If our Person constructor did not take arguments, the above would be enough, but since we want to dynamically pass arguments from the athelete constructor to the person constructor, we need to pass them inside the `super(...)` method.

```imba
class Athlete < Person
	def constructor name, age
		super(name, age)
```
We can then pass the new arguments that will be unique to the althele class.
```imba
class Person
	def constructor name, age
		name = name
		age = age
class Athlete < Person
	def constructor name, age, trophies
		super(name, age) # calls the parent constructor, and passes arguments.
		trophies = trophies
```
By creating an instance of Athlete, we will have the prototype of both Person and Athlete, and we can arguments to all three properties of `name`, `age`, and `trophies`
```imba
let joe = Athlete.new "Joe", 30, 5
```
Now, we can access the values of the properties of `joe`.
```imba
console.log joe.name // > "joe"
console.log joe.age // > "30"
console.log joe.trophies // >  5
```


## Extending a Class with Methods
When inheriting from another class, all of their props (instance variables) are accessible to you in the new class. So you can use those prop values on the methods of your new class.

Let's grab the name prop on our greet method. 

```imba
class Person
	def constructor name, age
		name = name
		age = age
class King < Person
	def constructor name, age
		super(name, age)
	def greet
		console.log "Your Royal Highness, King {name}."
let john = King.new 'John', 20
john.greet! 
```
console should print the following.
```imba
// > "Your Royal Highness, King John"
```

## Extending Methods with `Super()`
The **super** keyword is used to access and call methods of parent class in the prototype chain.

In the example below. `super` passes a value to the parameter `words` of the writes method on the parent prototype `Person`.

```imba
class Person
	def constructor name
		name = name
	def writes words
		console.log "{name} writes an average of {words} words a day."

class Designer < Person
	def writes
		console.log "Designer writes..."
		super 2000

class Developer < Person
	def writes
		console.log "Developer writes..."
		super 10000

var John = Designer.new "John"
var Eric = Developer.new "Eric"

John.writes!
Eric.writes!

// > Undefined writes an average of 2000 words a day
// > Undefined writes an average of 10000 a day
```


## Prototype Inheritance
We've been mentioning "prototype" and "inherit" a lot in the context of Classes. Here is more in depth explanation of what a prototype is.

Use this image as a reference, as you read further along.
<!-- TODO: Image may need to be updated and hosted differently -->
![Image](https://gblobscdn.gitbook.com/assets%2F-LSPhP31nsEVE02x38XJ%2F-M5yqVv694QoLvab7XYf%2F-M5ywrBlQSjrKDwYNvbk%2FPrototype%20Chain.png?alt=media&token=913a2acb-5cb7-465c-bf9a-9dd83c5c9e5b)

The Eric object is an instance of the Person Class, and the Person class is an instance also and instance of the Object of object by default. 
As the Eric object inherits the methods and props of the Person objecs, and the Person object inherits from the Object object, it means that the the Eric Object also inherits from the Object object.

That is called prototypal inheritance as a verb, or the prototype chain as a noun.

When you call a method or prop, Imba will try to find it in the exact object, if it cannot find it there, it will go up the prototype chain and look for it in the parent prototype, and so on. If there are no other object prototypes, and it has not found the prop or method, it will evaluate to null. Null is the final link in the prototype chain. When reached, the prop or method call will return as "undefined".

# [WIP] Decorators
# Functions
There are two types of functions in Imba
- Methods
- Blocks

In JavaScript, they're known respectively as Function Declarations, and Function Expressions.
> Imba automatically returns the last expression of the function.

## Declaring Functions (Methods)
Functions can have three different scopes.
- global
- class instance
- tag instance

By defining a function outside of classes or tags, they will be declared in the global scope.
```imba
def randomize
	Math.random()
```

## Class Methods
Functions are called ***Methods*** when used within classes. You probably know that already. When an object inherits from a class that contains methods, those methods will be accessible from that object. [Learn more about class methods here](/).

```imba
class Random
	def randomize
		Math.random!
let lucky = Random.new
console.log lucky.randomize!
```

## Tag Methods
Methods are more fun when paired with DOM events. In Imba you can create methods that are scoped to your components. You do so right within your tag component. And you can use Imba's event handlers to trigger methods that are defined right within your component.

```imba
tag app-root
	prop isClicked = true
	def toggle
		isClicked = !isClicked
	<self>
		<button.isClicked=isClicked :click.toggle> 
			if isClicked
				"edit"
			else
				"done"  
```

## Single Argument Functions
You can pass single argument to your functions by creating an argument keyword after the function name. In this example the word `num` is the argument keyword.

```imba
def square num
	num * num
console.log square(2)
```

## Optional Argument Functions
<!-- TODO: Need a working Example for this and better explanations. -->

```imba
def call url, method = 'GET'
	console.log(method, url)
	// do some work here
```

## Varying Number of Arguments
If you don't know how many arguments are going to be passed in or are trying to be flexible there is a syntax for that.

```imba
let array = ["Javascript", "React", "Vue"]
def race winner, ...rest
	"{winner} beats {rest.join(", ")}"
console.log race("Imba", array)
```

## Accessing Arguments via Shorthand
<!-- TODO: Need a working example for this -->

```imba
def method
	$0 # -> arguments
	$1 # -> arguments[0]
	$2 # -> arguments[1]

# sometimes practical for inline methods
var doubles = [1,2,3].map do $1 * 2
```
## Function Blocks (Function Expressions)
##### Syntax
```imba
var square = do(v) v * v
```

Function blocks are known as anonymous function expressions in JavaScript. They can be assigned and passed around. They have their own lexical scope / closure, but no dynamic scope. This means that self (implicit and explicit) inside the block still refers to the self of the outer scope.

Blocks can be passed in directly when calling functions, as the last argument.

## Arrow Functions
Coming from ES6, you might be wondering how to do the handy arrow functions. Arrow functions are syntactic sugar over Function Blocks. Well in Imba, the syntax for Function blocks is already concise. So arrow functions are not really neaded. 
Here's an arrow function converted to Imba function block.

`(element) =>` equals `do(element)`
Overall you will find that the Imba syntax will use the same number of characters.

Here are some convertions of arrow functions into Imba syntax for your reference.
##### JS

```js
fetch('https://jsonplaceholder.typicode.com/todos/1')
	.then(response => response.json())
	.then(json => console.log(json))
```
##### Imba
```imba
fetch('https://jsonplaceholder.typicode.com/todos/1')
	.then do(response) response.json!
	.then do(json) console.log(json)
```

Here's a more complex example from [MDN][https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions] in the original Javscript syntax.

##### js

```js
var elements = [
	'Hydrogen',
	'Helium',
	'Lithium',
	'Beryllium'
];

elements.map(function(element) {
	return element.length;
});

elements.map((element) => {
	return element.length;
});

elements.map(element => {
	return element.length;
});

elements.map(element => element.length);

elements.map(({ length: lengthFooBArX }) => lengthFooBArX);

elements.map(({ length }) => length);
```
Here is the same example converted into Imba syntax.

##### imba
```imba
var elements = [
	'Hydrogen'
	'Helium'
	'Lithium'
	'Beryllium'
]

console.log elements.map do(element)
	element.length
	
console.log elements.map do(element)
	element.length
	
console.log elements.map do(element)
	element.length
	
console.log elements.map do(element) element.length

console.log elements.map do({length: lengthFooBarX}) lengthFooBarX

console.log elements.map do({length}) length
```

# [WIP] Loops
<!-- WORKING ON -->
Loops in Imba provide simple ways to iterate through the content of your arrays or objects. And by "simple", we mean "super simple".

And loops are not limited to scripting within your functions and classes, they can also be used within your templating. That is a fantastic feature of Imba. That means that you won't have to have to be using `getElementByID("")` to inject data from your loops into the dom. Once you get used to this, it will be hard to back to the old ways.

Before we explore all the different ways to loop through your arrays, let's take a common Javascript for-loop as an example and compare it with the Imba syntax.
The example below is borrowed from [W3Schools](https://www.w3schools.com/js/tryit.asp?filename=tryjs_loop_for).
With this loop, we will render a line of text containing each car brand to the element with the ID of "demo".

##### JS
<!-- TODO: change to ```js -->
```imba
var cars = ["BMW", "Volvo", "Saab", "Ford", "Fiat", "Audi"];
var i;
for (i = 0; i < cars.length; i++) {
	text += cars[i] + "<br>";
}
document.getElementById("demo").innerHTML = text;
```
Here's what that looks like in Imba. You don't technically need the id of "demo" if it's sole purpose was for selecting the element and injecting data into it. In our example we just have the data injected right into the `<self>` tag. No need to use `document.getElementByID("")`. How cool is that?

##### Imba
```imba
var cars = ["BMW", "Volvo", "Saab", "Ford", "Fiat", "Audi"]
tag app-root
	<self #demo>
		for text in cars
			text + <br>
```

## `for in` Array loop
The `for in` loop is one of the most commonly used loops for iterating through each item in an array. So let's get familiar with it.

Notice how the expression can be done at the end of the parent line, and it will render the child for each item in the array.
```imba
tag app-root
	def render
		<self>
			<ul> for item in ['Imba','HTML', 'Javscript']
				<li> item
```
> **Note**: The word "item" can be replaced for any variable name you'd like.
```imba
for item in list
	item.id
```
## `for in when` Guarded Loop
```imba
for item in list when item.id > 1
	item.id
```
## `for {} in` destructuring arguments
```imba
for {id} in list
	id
```
## `for {} in when` destructuring arguments with guard
```imba
for {id} in list when id > 1
	id
```
## `for in [..]` inclusive range
```imba
for item in [0 .. 2]
	item
```

## `for in [...]` exclusive range
```imba
for item in [0 ... 2]
	item
```
## `for of` Loop
<!-- TODO: What's the difference for in and for of -->
Sometimes you need to loop through keys of an Object instaed of an array. For that you will use the uses the `for of` syntax.


```imba
for item of ['a','b','c']
	item

```
## For of 










































# If/Else Statements
`If/Else` statements can be used in nearly every scope in Imba (except in styles).
They can be used to run functions in the global scope, in class or tag methods, or even to conditionally render elements to the DOM.
## If
If statements can be used within functions, on the globa
##### syntax
```imba
if true
	"true"
else
	"false
```
Here's a practical example on how `if` statements can be used in templating.
```imba
tag App
	prop loggedIn = yes # alias for "true"
	def render
		<self>
			# if statements
			if loggedIn 
				<span> "you are logged in
```
## else
If we have two conditions that are mutually exclusive, we can simply use `else` as part of our logic.
```imba
tag App
	prop loggedIn = no # default value for prop
	def toggle
		loggedIn=!loggedIn
	def render
		<self>
			<buntton :click.toggle> 
				if !loggedIn # if not logged in
					"log in"
				else # if logged in
					"log out"
			if loggedIn # if logged in
				<span> "you are logged in"
			else # if not logged in
				<button> "you are logged out"
```
## elif (else if)
If you would like to chain multiple `if statements` before running `else`, you can use the `elif` (which is short for "else if") to chain your statements

```imba
tag app-root
	prop progress = 0
	def render
		<self>
			<input[progress] type='range' min=0 max=100 step=1> 
			<p> "{progress}% "
				if progress < 1
					<span> "start" 
				elif progress > 0 and progress < 100
					<span> "loading "
				else
					<span> "done "
```

# Logical Operators
`if/else` statements can do a lot, but the more complex your logic is, the more messy `if/else` can become.

## `boolean` Values
Boolean values of `true` and `false` are the core building blocks of all logical expression.
Imba has an alias for true and false, that may be more legible in certain instances. `yes` and `no`
```imba
var loggedIn = yes
var loggedIn = no
```
If something evaluates to true, your expression will run. 

## `boolean` operators
Boolean operatures help you get a return value of `true` or `false` out of almost combination of Javascript values.

To start, Imba carries over all the boolean operators from Javascript, with a few aliases for the commonly used `strict equal` and `strict-not-equal` operators.

Here's the list.
##### syntax
```imba
item == 10 # check
item === 10 # strictly equal
item is 10 # also strictly equal
item != 10 # not equal
item !== 10 # strictly not equal
item isnt 10 # also strictly not equal
item > 10 # greater than
item < 10 # less than
item >= 10 # greater than or equal
item <= 10 # less than or equal
```

It is common practice to use strict-equal over strict-not-equal wherever possible. Why? strict-equal will make sure the value types are also equal. Otherwise, it will return true even if you pair a string of `"10"` and a number of `10`.

```imba
10 == "10" # true (not-strict-equal)
10 === "10" # false (strict-equal)
10 is "10" # false (strict-equal)
```


## `and` operator
If **all** expressions chained with the `and` operator evaluate to true, then the whole expression will return `true`.

##### syntax
```imba
and # Imba syntax
&& # js syntax also supported
```
The code will run only if all arguments are truthy.
```imba
if yes and yes
	# code will run
if yes and no
	# code will not run.
```

You may also chain and nest as many expressions as you'd like.

```imba
if yes and yes and (yes and yes)
	# code will run
```
Here's a basic `and` expression
##### Example
```imba
loggedIn = true
admin = true
tag app-root
	<self>
		if loggedIn and admin
			<h1> "welcome admin"
```

## OR operator
The `OR` operator allows you to chain expressions together in a single expression. If any expression evaluates to true, then the whole expression will return `true`.

Imba supports the Javascript syntax `&&`, but it also has an alias of `or` for the OR operator, we hope the alias is not hard to get used to.

##### syntax
```imba
or # imba syntax 
|| # js synax also supported
```

The `or` operator allows you to evaluate if two conditions are true in a single line. The code will run if any argument is truthy.
```imba
if no or yes
	# will run
if no or no
	# will not run
```
Got it?

## Switch Operator
If all your expressions are going to be mutually exclusive, you can just use a switch operator.

##### syntax

```imba
let emotion = 'happy'
switch emotion
	when 'happy'
		console.log '😀'
	when 'sad'
		console.log '😢'
	else
		console.log '🤷‍♂️'
```
The if statements below essentially do the same thing, but a switch statement can your code a lot neater in many cases.
```imba
let emotion = 'happy'
if emotion is 'happy'
	console.log '😀'
elif emotion is 'sad'
	console.log '😢'
else 
	console.log '🤷‍♂️'

```
## Ternary Operator
### Single-line Ternary Operator
The ternary operator is sort of a quick one-line `if/else` statement.
As with many operators, you can use a syntax similar to Javascript for this. 
```imba
if (condition) ? function : function
```
But as usual, Imba has a less cryptic alias for this.
##### syntax
```imba
if (condition) then function else function
```
Here's a ternary operator in practice.
```imba
# height in centimeters
var height = 100
if height >= 80 then console.log('You can ride the rollercoaster!') else console.log('Sorry, you are a few centimeters short.')
# >>> Congratulations, you can ride the rollercoaster
```
### Multi-line Ternary Operator
Writing a ternary operator over multiple lines can make your code even more legible. Make sure all the parts of a ternary operator are on the same indentation level and in the same order.
```imba
if # expression here
then # value or function here
else # value or function here
```
```imba
# Multiline ternary operator
if height >= 80
then console.log(firstName + ' can ride a rollercoaster')
else console.log(firstName + ' cannot ride a rollercoaster')
```
## `NOT` Operator
As you would in Javascript, you can negate any boolean value with an exclamation mark at the beginning of any object that returns a boolean value. Here are a few examples.
```imba
# (not)true value
console.log !true # false

# (not)loggedIn variable
var loggedIn = true
console.log !loggedIn # false

# (not)isLoggedIn Method
def isLoggedIn
	true
console.log !isloggedIn() # false

```
A good use for the `NOT` operator is for toggling a boolean value upon an event. Here an example where we toggle a state upon a click event.

```imba
tag app-todo
	prop visible = true
	def toggleItem
		visible = visible
	def render
		<self>
			<button @click.toggleItem> "toggle"
			<h1> 
				if visible then "Now you see me..." else "now you don't!"
```

# [WIP] Modules

# [WIP] Switch Statements
