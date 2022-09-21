# Decorators

> [tip box yellow] This functionality is still experimental.

### TLDR

You can define and use decorators to replace a property with a new
[descriptor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#description)
at runtime.

```imba
# [preview=console]
# Defining decorators:
def @example target, name, desc
	console.log "Creating new property for {name} at runtime."
	desc.value = do
		console.log "This function replaces the decorated one."
	desc

# Using decorators:
class Test
	@example def one
		console.log("This will not get logged.")
	@example def two
		console.log("This will not get logged.")

new Test!.one!
```

See also [additional details](#additional-details).

### Guide

Let's say we want to do something before and after
calling this simple function:
```imba
def calc
	5 * 5
```
For example, what if we want to log the fact that `calc` was called
and also log the result?
Simple enough:
```imba
# [preview=console]
def calc
	console.log "In calc."
	let result = 5*5
	console.log result
	result
calc!
```
The central question here is,
*what if we want to do this to more than one function?*

We can make a `log` function and pass our `calc` function to that:
```imba
# [preview=console]
def log fn
	console.log "In {fn.name}."
	let result = fn!
	console.log result
	result
def calc
	5*5
log(calc)
```
This is reusable, and `calc` is no
longer cluttered with additional logic,
but instead of calling `calc` we'd have to call `log(calc)`
which isn't ideal.

What if instead of having `log` actually call anything,
we have it return a *new* function?
```imba
# [preview=console]
def logify fn
	do
		console.log "In {fn.name}."
		let result = fn!
		console.log result
		result
def calc
	5*5
calc = logify(calc)
calc!
```
`logify`, in this case, would be called a higher order function.
This addresses our issue with the previous solution,
but it's kind of awkward.

Decorators allow us to do something similar to the previous snippet
with a convenient syntax and additional options.
```imba
# [preview=console]
def @log target, name, desc
	let prev = desc.value
	desc.value = do
		console.log "In {name}."
		let result = prev!
		console.log result
	desc
# ---
class Test
	@log def calc
		5*5
new Test!.calc!
# ---
```
Much cleaner.
What does the code for our `@log` decorator look like?
```imba
def @log target, name, descriptor
	let prev = descriptor.value
	descriptor.value = do
		console.log "In {name}."
		let result = prev!
		console.log result
	descriptor
```
It looks overwhelming but don't worry, with some patience you'll
be writing your own decorators in no time.

The parameters of a decorator are as follows:
#### Target
Target refers to the class constructor's prototype.
You probably won't need this.

#### Name
`name`, or sometimes `key`, is the name of the property being decorated.
So in the case of our calc example:
```imba
@log def calc
	5*5
```
`name` would just be the string `"calc"`.

#### Descriptor
In JavaScript, when you do
```imba
obj[key] = value
```
You could say that `obj` has a *property* named `key`.
However, it is not as simple as just a new key mapping to a value.
There is some additional metadata, if you will,
associated with this property.
Whether the property is enumerable or not,
writeable or not, etc.

`descriptor` is an object containing the aforementioned "value"
of the decorated property as well as all the additional "metadata".
You can read more about
[descriptors on mdn](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#description),
but the main descriptor properties we'll be using are:
- `descriptor.value` for functions.
- `descriptor.get` for getters.
- `descriptor.set` for setters.

In the case of our calc example:
```imba
# [preview=console]
def @log target,name,desc
	console.log desc.value

class Test
	@log def calc
		5*5
```
`descriptor.value` would just be the `calc` function itself.

#### Return value
The return value is the new descriptor.
If the return value is null, the original descriptor is used,
side effects included.
```imba
# [preview=console]
def @log target, name, desc
	desc.value = do
		console.log "This will log."
	return

class Test
	@log def main
		console.log "In main."

let test = new Test!
test.main!
```

This might remind you of our higher order function example above,
where we **replaced** `calc` with the function returned by `logify(calc)`:
```imba
calc = logify(calc)
```
It's almost exactly the same, except we have access to the entire
descriptor, and the property being decorated is *automatically* **replaced**
with the new descriptor at **runtime**.

For clarity,
notice that this code will log twice even though we're
not calling any functions because the decorated properties are
replaced at runtime:
```imba
# [preview=console]
def @example target, name, desc
	console.log "This will be logged once for each decorated property at runtime."

class Test
	@example def main
		return
	@example def test
		return
```

#### A more cohesive logging decorator
Let's finally write our own decorator that also handles the arguments
of the decorated function.
```imba
def @log target, name, desc

	# For this example we only want this decorator to apply to functions
	return unless typeof desc..value is 'function'

	# Store the original function
	let prev = desc.value

	# Replace the decorated function with this one
	desc.value = do(...args)

		# Call the original function and store the result
		const result = prev.apply(this, args)

		# Log the name, args, and result
		console.log name
		console.log args
		console.log result

	# Return our new descriptor
	desc
```
Now let's test it out:

```imba
# [preview=console]
def @log target, name, desc
	return unless typeof desc..value is 'function'
	let prev = desc.value
	desc.value = do(...args)
		const result = prev.apply(this, args)
		console.log "Called {name}:"
		console.log args
		console.log result
	desc
# ---
class Test
	@log def main a, b, c
		a * b * c

new Test!.main(5, 6, 7)
# ---
```
Yay!

### Additional Details

#### Placement
You can place decorators either above a property or before a property.

```imba
# [preview=console]
def @nothing target, name, desc
	desc
# ---
class Test

	@nothing
	def one
		console.log "This works."

	@nothing def two
		console.log "This works too!"

let test = new Test!
test.one!
test.two!
# ---
```

#### Decorator Arguments
Arguments are bound as `this` in the decorator.
```imba
# [preview=console]
def @example
	console.log this
class Test
	@example(1, 2, 3) def main
		return
```

#### Multiple decorators
```imba
# [preview=console]
def @one target, name, desc
	let prev = desc.value
	desc.value = do
		console.log "one"
		prev!
	desc

def @two target, name, desc
	let prev = desc.value
	desc.value = do
		console.log "two"
		prev!
	desc

class Test
	@one
	@two
	def main
		console.log "Called main."

new Test!.main!
```

#### Implicit returns
Imba implicitly returns the last statement,
so even though side effects can be used to modify the
descriptor, if the last statement is `desc.value = do ...`,
the `do` function will be implicitly returned.
Since the returned function won't contain a `value` property,
it will not update the decorated class member's `value`.

#### Execution context
You might be wondering why we need to use
[apply](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)
instead of just calling the function directly:
```imba
const result = prev.apply(this, args)
```

That has to do with the execution context of the function.
It's an odd topic, but if you look at the output of this example:
```imba
# [preview=console]
def @log target, name, desc
	let prev = desc.value
	desc.value = do
		console.log "`this` in @log: {this}"
		prev!
	desc

class Test
	@log def one
		console.log "`this` in one: {this}"

	def two
		console.log "`this` in two: {this}"

let test = new Test!
test.one!
test.two!
```
You'll notice that even though it seems like we're calling
`one` and `two` in the same manner,
since `one` is being called inside of this function:
```imba
	desc.value = do
		console.log "In @log: {this}"
		prev!
```
It loses its execution context. More on `this` can be found on [mdn](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this).

#### Implementation
For those interested, this is slightly simplified
version of how decorators work behind the scenes:
```imba
# [preview=console]
# inserted at compile time
def decorate decorator,target,key
	let desc = Object.getOwnPropertyDescriptor target,key
	let new_desc = decorator(target,key,desc) or desc
	new_desc and Object.defineProperty target,key,new_desc

def log target,key,desc
	desc.value = do
		console.log "Called {key}."
	return

class Test

	# inserted at compile time
	static def init
		decorate log.bind(["args"]),this.prototype,'main'

	def main
		console.log "Original."

# inserted at compile time
Test.init!

new Test!.main!
```
