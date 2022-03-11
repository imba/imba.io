---
id: ji15fd3340i3d4bik7sntae
title: 77 Fix the Compile Errors from the Markdown
desc: ''
updated: 1646819388336
created: 1646819388336
url: 'https://github.com/imba/imba.io/issues/77'
status: CLOSED
issueID: MDU6SXNzdWU1MDMwNDA0MTM=
author: 'https://github.com/aalemayhu'
---
It looks like what is happening is that the markdown renderer extension to code is triggering compilation on code snippets which are not supposed to be compiled.

The compile errors don't prevent the server for running but are annoying and make testing changes that happen at initial load time harder since so much text is outputted by default. I comment out the error logging locally but would be good to have a proper fix.

https://github.com/imba/imba.io/blob/master/src/util/markdown.imba#L146-L150

Related-to: #28 
