Official site for Imba. Work in progress.

## Run
```
# clone the repository
git clone https://github.com/somebee/imba.io.git

# enter the folder
cd imba.io

# install dependencies
npm install

# compile javsacript
npm run build

# run server (on port 3011)
gulp server

# visit localhost:3011 in your browser
```

## Develop
```
npm run build
# to build www/client.js for production

npm run watch
# to build www/client.js for development
# this will include sourcemaps++ and
# recompile whenever files change

gulp watch
# to build/watch less to css
```

`gulp watch` to continually recompile stylesheets from less/

`gulp default` to start server and automatically restart on changes