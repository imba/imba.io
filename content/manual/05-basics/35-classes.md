# Classes

##### Class declarations
```imba
class Retangle
    def constructor height, width
        self.height = height
        self.width = width

    def setup
        self
```

##### Class expressions
```imba
var expr = class
    def constructor height, width
        self.height = height
        self.width = width
```

## Default constructor

If you do not define a constructor in your class, Imba creates a default constructor that takes a single object-argument and sets the declared properties.

```imba
class Todo
    prop title = 'Untitled'
    prop done = no
    prop due = no

let todo = new Todo title: 'Some title'
```

### Properties

### Methods

### Getters

### Setters

### Implicit self

## Inheritance

### super

# Structs

> Struct is an experimental lightweight type of class included in the Imba v2 alpha. Might be removed and/or merged back into general class before release.

```imba
struct Rect(width, height)
const square = new Rect(10,10)
```

##### Default values

```imba
struct Rect
    width=0
    height=0
    x=0
    y=0
    get area do width * height

# @log rect
new Rect(width:10,height:10,x:4)
```

##### Struct declaration
```imba
struct Rect
    width = 0
    height = 0
    x = 0
    y = 0

# @log construct a Rect
new Rect(width:100,height:40,x:10)
# const rect = new Rect width:100,height:40,x:10
```

By default - the constructor of a `struct` will expect a plain object containing some or all of the properties declared on the struct. In many cases you might want to 

##### Custom constructor
```imba
struct Point x=0,y=0
    def round
        x = Math.round(x)
        y = Math.round(x)
```

## Structs vs Classes

- Structs come with a default constructor
- Structs can be created without the `new` keyword
- Structs cannot be extended

## Add

- When do you want to use a struct instead of a class?
- When you create a bunch of similar objects inside a method and want default values etc.
- How can you choose whether to accept an object or a 