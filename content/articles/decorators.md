
## Introduction

## Using decorators

- Decorators must be imported or declared in-file
- Can be chained
- Multiline or single 

Decorators are used to extend properties and methods with common functionality. Let's say you want to log when calling a method.

```imba

def @log target, key, descriptor
    let fn = descriptor.value
    descriptor.value = do
        console.log("call {key}")
        let res = fn.apply(this,arguments)
        console.log("called {key}")
        return res
    return descriptor

# ---
class Item
    # by adding @log before def we let the @log decorator
    # alter the function definition to inject logging
    @log def setup
        yes

var item = Item.new
item.setup!
```

This can also be useful for properties. Let's say we want to trigger a function whenever a property changes. We can define a `@watch` decorator, and use it like this:

```imba

def @watch target,key,desc
	let meth = this[0] or (key + 'DidSet')
	let setter = desc.set

	if setter isa Function
		desc.set = do(value)
			let prev = this[key]
			if value != prev
				setter.call(this,value)
				this[meth] and this[meth](value,prev,key)

	return desc

# ---
class Item
    @watch prop name

    def nameDidSet to, from
        console.log "name changed from {from} to {to}"

var item = Item.new
item.name = 'john'
item.name = 'jane'
```

## Modifiers

Decorators can support additional arguments to alter their behaviour. Decorators support a modifier syntax like tag properties.

```imba
@watch.async
# watch(async:yes)
@watch.call('render')
# watch(async:1,call:'render')
@watch.async.call('render')
@watch.async.call-render

@field.persist(no).local
# watch(persist:no,local:yes)

@log.profile.prefix('calling')
# log(profile:yes,prefix:'calling')

@throttle.immediate.prefix('calling')
# throttle(immediate:yes,prefix:'calling')
@throttle.immediate.prefix'calling'.test
@throttle.immediate.delay-200
@throttle.immediate.delay(200)

@cssvar.px.name('app-width')
```

```imba
<div @click.throttle-200=handler>
<div @click.throttle(200)=handler>
<div :hover.text(underline,bold,teal-200)=handler>
```

`@watch.async` Would call

```imba
class Item
        
```


## Defining decorators

Decorators are declared like regular functions, only the name starts with a `@`.
```imba
def @decorator target, key, descriptor
    # alter the existing descriptor or return a new one
    return descriptor
```

## Examples

```imba
def @decorator target, key, property
```

- @watch for calling functions when setter changes. With async flags
- @throttle for making sure functions are not called too often. Flags (immediate)
- @log should take a
- @flag for setting and unsetting a flag. Defaults to the property name
- @cssvar
- @persisted (session | local) - will look for some unique id or reference


### @watch



## Resources
- https://github.com/tc39/proposal-decorators
- https://www.typescriptlang.org/docs/handbook/decorators.html

## Questions

- Do we need to support modifiers just yet? Is it not enough to pass in arguments?
- How do they differ from JS proposed decorators?
- Where can you use decorators?
- Can you decorate standalone methods? If so - how? There is no descriptor?
- If we add a watch decorator to a property with a default value - how will this work?
- Are properties with modifiers inherited?