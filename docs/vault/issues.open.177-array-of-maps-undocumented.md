---
id: widdxlbe72app9j0ks0fwcu
title: 177 Array of Maps Undocumented
desc: ''
updated: 1646819629240
created: 1646819629240
url: 'https://github.com/imba/imba.io/issues/177'
status: OPEN
issueID: MDU6SXNzdWU3ODc2OTMxNzI=
author: 'https://github.com/eulores'
---
At least I didn't find no reference in [arrays](https://imba.io/language/grammar/literals/arrays) or [objects](https://imba.io/language/grammar/literals/objects)

For example, this compiles fine 
```
let todos = [
	title:'one'
	completed:false
	-
	title:'two'
	completed:false
	-
	title:'three'
	completed:true
]
```
and is nicer to read than the alternative
```
let todos = [{title:'one', completed:false}, {title:'two', completed:false}, {title:'three', completed:true}]
```
