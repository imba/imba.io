---
title: Scripting
multipage: true
---
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
# [WIP] Functions
# [WIP] Loops
# [WIP] Conditional Statements
# [WIP] Operators
# [WIP] Modules
# [WIP] Variables
# [WIP] Switch Statements