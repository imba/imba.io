---
title: Operators
---
# Operators

## Arithmetic

```imba
1 + 2 # Addition
3 - 2 # Subtraction
6 / 3 # Division
2 * 2 # Multiplication
5 % 2 # Remainder / Modulo
2 ** 2 # Exponential
-i # Unary negation
+i # Unary plus
```

## Assignment

```imba
item = 100 
item ||= 100 # If falsy assignment
item &&= 100 # If truthy assignment
item ?= 100 # If null assignment
item += 100 # Addition assignment
i++ # Increment assignment
i-- # Decrement assignment
item -= 100 # Decrement assignment
item *= 100 # Multiplication assignment
item /= 100 # Division assignment
item %= 100 # Remainder assignment
item **= 100 # Exponential assignment

item <<= 1 # Left shift assignment
item >>= 1 # Right shift assignment
item >>>= 1 # Unsigned right shift assignment
item &= 1 # Bitwise AND assignment
item ^= 1 # Bitwise XOR assignment
item |= 1 # Bitwise OR assignment
```

## Comparison
```imba
x == y # Equality
x != y # Inequality
x === y # Strict equality
x is y # Also strict equality
x !== y # Strict inequality
x isnt y # Also strict inequality
x > y # Greater than
x >= y # Greater than or equal
x < y # Less than
x <= y # Less than or equal
10 > x > 5 # Chained comparison
```

## Unary
```imba
delete object.property # delete
```

# Arithmetic operators

#### Addition
```imba
1 + 2
```

#### Subtraction
```imba
3 - 2
```

#### Division
```imba
6 / 3
```

#### Multiplication
```imba
2 * 2
```

#### Remainder
```imba
5 % 2
```

#### Exponential
```imba
2 ** 2
```

#### Unary negation
```imba
-i
```

#### Unary plus
```imba
+i
```

# Assignment operators

##### Cheat sheet
```imba
item = 100 
item ||= 100 # If falsy assignment
item &&= 100 # If truthy assignment
item ?= 100 # If null assignment
item += 100 # Addition assignment
i++ # Increment assignment
i-- # Decrement assignment
item -= 100 # Decrement assignment
item *= 100 # Multiplication assignment
item /= 100 # Division assignment
item %= 100 # Remainder assignment
item **= 100 # Exponential assignment

item <<= 1 # Left shift assignment
item >>= 1 # Right shift assignment
item >>>= 1 # Unsigned right shift assignment
item &= 1 # Bitwise AND assignment
item ^= 1 # Bitwise XOR assignment
item |= 1 # Bitwise OR assignment
```

#### Assignment
```imba
item = 100
```

#### If falsy
```imba
item ||= 100
```

#### If truthy
```imba
item &&= 100
```

#### If null
```imba
item ?= 100
```


#### Addition
```imba
item += 100
```

#### Subtraction
```imba
item -= 100
```

#### Postfix Increment
```imba
i++
```

#### Prefix Increment
```imba
++i
```


#### Postfix Decrement
```imba
i--
```

#### Prefix Decrement
```imba
--i
```

#### Multiplication
```imba
item *= 100
```

#### Division
```imba
item /= 100
```

#### Remainder
```imba
item %= 100
```

#### Exponential
```imba
item **= 100
```

#### Left shift
```imba
item <<= 1
```

#### Right shift
```imba
item >>= 1
```

#### Unsigned right shift
```imba
item >>>= 1
```

#### Bitwise AND
```imba
item &= 1
```

#### Bitwise XOR
```imba
item ^= 1
```

#### Bitwise OR
```imba
item |= 1
```

# Comparison operators

#### Equality
```imba
x == y
```

#### Inequality
```imba
x != y
```

#### Strict equality
```imba
x === y
x is y
```

#### Strict inequality
```imba
x !== y
x isnt y
```

#### Greater than
```imba
x > y
```

#### Greater than or equal
```imba
let x = 3, y = 2
# ---
x >= y
```

#### Less than
```imba
let x = 2, y = 3
# ---
x < y
```

#### Less than or equal
```imba
let x = 2, y = 3
# ---
x <= y
```

#### Chained comparisons
```imba
let x = 2
# ---
10 > x > 5
```

# Unary operators

#### delete
```imba
delete object.property
```

#### void
```imba
# todo
```

#### typeof
```imba
# todo
```

# Bitwise operators

# isa / instanceof