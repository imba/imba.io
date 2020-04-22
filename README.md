Official site for Imba. Work in progress.

## Run
```
# clone the repository
git clone https://github.com/imba/imba.io

# enter the folder
cd imba.io

# install dependencies
npm install

# package content from content/ (continously)
npm run watch-content

# run server
npm start
```

Because the site uses service workers it requires https: with a trusted certificate.
To test things in development you need to do it via Chrome launched with specific args:

```bash
open -na Google\ Chrome --args --ignore-certificate-errors --unsafely-treat-insecure-origin-as-secure=https://localhost
# if this does not work - try
# /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --ignore-certificate-errors --unsafely-treat-insecure-origin-as-secure=https://localhost
```

Now visit https://localhost:9000/ in that browser

## Looking for projects using Imba?

The [Awesome Imba][0] list has several projects and resources listed surrounding
Imba.  Other noteworthy projects are 

- [Scrimba][1] - Learning platform to code with interactive tutorials
- [Reiknistofa fiskmarkaða][3] - The Iceland fish market auction
- [GitSpeak][2] - Fast GitHub client

## License

[MIT](./LICENSE)

Copyright (c) 2015-present, Imba

[0]: https://github.com/koolamusic/awesome-imba
[1]: https://scrimba.com/
[2]: https://gitspeak.com/
[3]: https://rsf.is/