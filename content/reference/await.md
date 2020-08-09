# await

### Fetching from url

```imba
def load
    let req = await window.fetch '/some/api.json'
    let json = await req.json!
    # do something with the json here
```
Any method that uses await will automatically be treated as async methods.
```imba
def load action
    let req = await window.fetch "/api/{action}.json"
    return req.json!

def main
    let items = await load 'items'
    let user = await load 'user'
```