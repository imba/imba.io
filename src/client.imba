
import App from './app'
import Site from './views/Site'
document:body:innerHTML = '' 
Imba.mount <Site[App.deserialize(APPCACHE)]>