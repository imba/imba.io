---
id: fdnc5nnlah1n65pzbdtnew7
title: 7 Could You Explain That Todotodotodoid
desc: ''
updated: 1646819388338
created: 1646819388338
url: 'https://github.com/imba/imba.io/issues/7'
status: CLOSED
issueID: MDU6SXNzdWUxMzE3MTMyMjk=
author: 'https://github.com/bbodi'
---
Could you explain the following row from TodoMVC-Imba code: 
app.imba: 92

```
<ul.todo-list>
    for todo in items
        <todo[todo]@{todo.id}>
           |    |   ^ ???
           |    ^ pass the todo object to the tag as their 'object' field
           ^ create a todo tag 
```

Sorry if you already mentioned it somewhere, but I couldn't find it in the docs.
