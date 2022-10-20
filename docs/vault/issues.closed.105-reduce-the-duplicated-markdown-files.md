---
id: uq3twhihjyemeqq2lsb28xe
title: 105 Reduce the Duplicated Markdown Files
desc: ''
updated: 1646819388336
created: 1646819388336
url: 'https://github.com/imba/imba.io/issues/105'
status: CLOSED
issueID: MDU6SXNzdWU1MjcwNDY3ODQ=
author: 'https://github.com/aalemayhu'
---
Due to the way we load the files and cache them I choose to duplicate the structure so routing does not break. When a language has not managed to translate everything yet it results in duplicate content. It would be nice to only have the files that are actually translated in history. So maybe we can load the English directory and then dynamically merge it with the selected language. This would provide the desired fallback and reduce duplication in the repository.
<!--!https://gitspeak.com/-/nip3nqL0886f7-->
