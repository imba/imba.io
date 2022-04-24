---
id: 955kk39lnb6qqw8qg1ty3n3
title: 6 How to Add Event Handler to Standard Element
desc: ''
updated: 1646819388338
created: 1646819388338
url: 'https://github.com/imba/imba.io/issues/6'
status: CLOSED
issueID: MDU6SXNzdWUxMjg1NjU1MDU=
author: 'https://github.com/jkleiser'
---
Is it possible to add an onclick handler to e.g. just one button element without first subclassing button? I didn't find this mentioned in the imba docs.
Handling onclick by subclassing of course worked:

```
tag clickable-button < button
   def onclick evt
      console.log("clickable-button onclick, target %s", evt.target)
```
