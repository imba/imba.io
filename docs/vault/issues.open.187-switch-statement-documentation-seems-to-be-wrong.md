---
id: snc1q91w4e2nc9b9yflkl5n
title: 187 Switch Statement Documentation Seems to Be Wrong
desc: ''
updated: 1646819629240
created: 1646819629240
url: 'https://github.com/imba/imba.io/issues/187'
status: OPEN
issueID: MDU6SXNzdWU4MTgyNTU3NTc=
author: 'https://github.com/BigZaphod'
---
On this page: https://imba.io/language/operators

Switch is documented as having a syntax like this:

```
switch status
when "completed"
  console.log "This project has been completed"
when "archived"
  console.log "This project has been archived"
else
  console.log "This project is active"
````

However it appears to _actually_ have a syntax like this (note indented `when`):

````
switch status
  when "completed"
    console.log "This project has been completed"
  when "archived"
    console.log "This project has been archived"
  else
    console.log "This project is active"
````
