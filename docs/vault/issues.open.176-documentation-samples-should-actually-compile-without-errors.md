---
id: 6hnadhj43us56vhzin2qrfh
title: 176 Documentation Samples Should Actually Compile without Errors
desc: ''
updated: 1646819629241
created: 1646819629241
url: 'https://github.com/imba/imba.io/issues/176'
status: OPEN
issueID: MDU6SXNzdWU3ODc2ODA3OTA=
author: 'https://github.com/eulores'
---
#### Basic Syntax / Methods
```
def method name = 'imba'
	console.log param
```
should be
```
def method name = 'imba'
	console.log name
```
---
#### Basic Syntax / Class Declarations
```
let todo = new Todo 'Read introduction'
```
should be
```
let todo = new Todo title: 'Read introduction'
```
otherwise the constructor would not take `Read introduction` to initialize title.

---
#### Basic Syntax / Loops & Iteration
```
for num in array when num != 2
	num
```
`array` is undefined

---
#### Basic Syntax / Components
```
imba.mount <todo-app data=todos>
```
`todos` is undefined
