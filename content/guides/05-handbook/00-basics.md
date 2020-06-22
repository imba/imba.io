# Introduction

```imba
let number = 42
let bool = yes
# strings
let string = 'the answer is {number}'
let dynamic = "the answer is {number}"
let template = `the answer is {number}`

let regex = /answer is (\d+)/
let array = [1,2,3]
let object = {name: 'Imba', type: 'language'}

# objects can also be indented
let details =
    name: "Imba"
    version: 2.0
    repository: 'https://github.com/imba/imba'
    inspiration: ['ruby','python','react','coffeescript']
```

# Overview

## Significant whitespace

## Implicit self

Coming from JavaScript, this is one of the most important concepts you need to grasp.

## Implicit return

```imba
def grade student
    if student.excellentWork
        'A+'
    elif student.okayStuff
        if student.triedHard
            'B'
        else
            'B-'
    else
        'C'
```

## Type Annotations