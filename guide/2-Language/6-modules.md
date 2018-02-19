# Modules

### export
```imba
export var TYPE = 3

export def mult a,b
    a * b

export class Todo
    def initialize
        self

export tag TodoView
    def render
        <self> data:title
```

### import

```imba
# index.imba
import {mult,Todo,TodoView,TYPE} from './somefile'

var todo = Todo.new
var result = mult(1,2)
var view = <TodoView[todo]>

```

### require

```imba
var fs = require 'fs'
var stuff = require './somefile'

var body = fs.readFileSync('something.txt')
var todo = stuff.Todo.new
var result = stuff.mult(1,2)
```
Require works exactly like in plain JavaScript