---
id: 7lfjav2c1vzc4ko3sbtcv2i
title: 220 Wrong Output in Dynamic Keys Example Code
desc: ''
updated: 1646819388333
created: 1646819388333
url: 'https://github.com/imba/imba.io/issues/220'
status: CLOSED
issueID: I_kwDOAtkXbM494u8M
author: 'https://github.com/poeck'
---
In the [Literal Types Section](https://imba.io/language/literal-types#objects) under Objects theres this code snippet:
```
let field = 'age'
let person = {name: 'Bob Smith', [field]: 32, gender: 'male'}
console.log(person.age) # => 'Bob Smith'
```
The output should be 32 instead of 'Bob Smith'.
I also ran the code and can confirm this problem.
