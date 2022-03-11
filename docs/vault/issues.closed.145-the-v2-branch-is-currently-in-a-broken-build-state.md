---
id: 4tvns3gvbcarhtho7yqrtd5
title: 145 the V2 Branch Is Currently in a Broken Build State
desc: ''
updated: 1646819388335
created: 1646819388335
url: 'https://github.com/imba/imba.io/issues/145'
status: CLOSED
issueID: MDU6SXNzdWU2ODM3ODc0ODY=
author: 'https://github.com/aalemayhu'
---
I don't think we are running a recent version on the v2 site. I wanted to experiment with [DocuSearch](https://docsearch.algolia.com/)  but the last deployment failed. See the GitHub action but easily reproducible locally. I can reproduce this locally too and it happened shortly after installing latest Imba, I think.

## Steps to reproduce

```
npm run build
[...]
error compiling doc-widgets.imba
error compiling console.imba
```

https://github.com/imba/imba.io/actions/runs/218638097
