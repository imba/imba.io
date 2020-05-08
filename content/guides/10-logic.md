---
title: Logic & Data
multipage: true
---
# [WIP] Objects
## Object Literal Syntax
In Imba you can omit curly braces, and commas at the end of each line.
##### Syntax
```imba
var objectName =
	keyName: "value"
```
</br>

##### Example
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
##### Example
```imba
// access property via dot notation
console.log language.name
// access property via string
console.log language['launchDate']
```
## Use Variables as keys
The second syntax for selecting keys `objectName['keyname']` is useful if you want to dynamically pass the key name to your object selector.
##### example

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
##### Example
```imba
let language =
    name: 'js'

# mutates object data
langauge.name = 'imba'

# prints mutated object value instead of original value
console.log(language.name)
>>> 'imba'
```
## Create New Objects
If you'd like to access data by the use of a name or key, you need to store that data in an object using key/value pairs. 
You will then be able to access the data as properties of that object. 
##### Syntax
```imba
let objectName = Object.new
```
##### Example
```imba
# Creates an object with the name chico.
let chico = Object.new

# Declare new properties and values to the chico object after it was created.
chico.name = 'Chico'
chico.lastName = 'Bu'
chico.birthYear = '2019'

# Print chico Object to the console.
console.log chico
# >>> Object { name: "Chico", lastName: "Bu", birthYear: "2019" }

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
##### Example
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
##### example
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
##### example
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
<!-- TODO: Continue with Setting Properties with methods. -->
<!-- https://app.gitbook.com/@imba/s/guide/~/drafts/-M6osQFp4Ya17gXvtMAO/logic-and-data/objects-and-object-properties -->
# [WIP] Arrays

# [WIP] Async / Await
# [WIP] Comments
# [WIP] Classes
# [WIP] Decorators
# [WIP] Functions
# [WIP] Loops
# [WIP] Conditional Statements
# [WIP] Operators
# [WIP] Modules
# [WIP] Variables
# [WIP] Switch Statements