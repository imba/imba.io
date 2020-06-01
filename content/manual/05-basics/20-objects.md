---
title: Objects
---

# Objects

## Object Literal

##### Syntax
```imba
let object = {a: 'foo', b: 42, c: {}}
console.log(object.a) # => 'foo'
```

##### Indented
```imba
let person =
    name: 'Bob Smith'
    age: 32
    gender: 'male'
console.log(person.name) # => 'Bob Smith'
```

##### Dynamic keys
```imba
let field = 'age'
let person = {name: 'Bob Smith', [field]: 32, gender: 'male'}
console.log(person.age) # => 'Bob Smith'
```

##### Dot notation `.`
```imba
let person = {name: 'Bob Smith', age: 32, gender: 'male'}
# ---
person.name
person.age = 33
```

##### Bracket notation `[]`
```imba
let person = {name: 'Bob Smith', age: 32, gender: 'male'}
# ---
person['name']
person['age'] = 33
```

##### Destructuring
```imba
let a = 'foo'
let b = 42
let c = {}
let object = {a,b,c}
console.log(object) # => {a: 'foo', b: 42 c: {}}
```