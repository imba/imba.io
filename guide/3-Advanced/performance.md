---
title: Performance
order: 2
---

# Performance

The virtual dom was a fantastic innovation. Because the process of updating / patching the dom to reflect state-changes became much faster, we could start writing our views in a declarative manner.

Sadly, virtual doms are still quite slow. Imba has chosen a very different approach that turns out to be *a lot* faster.

> [Screencast about Imba performance](https://scrimba.com/p/c6B9rAM)

### The Memoized DOM

```imba
var tip = "Item"
var div = <div.large title=tip> "Hello"
```

Even though tags look declarative in Imba, they compile to a bunch of operations building and altering the state of a the tag.

```javascript
var tip = "Item";
var div = createElement('div').flag('large').setTitle(tip).setText("Hello");
```

So, what if we had split up the creation of the div and the rest of the operations?

```javascript
var tip = "Item";
var div = createElement('div');
var render = function(){
    div.flag('large').setTitle(tip).setText("Hello");
}
```

Now, the attributes will be applied to div whenever we call render. If we change the value of tip, and call render again, the div will now have a different title attribute. This is a barebones illustration of what the Imba compiler does under the hood.

```imba
tag Component
    def render
        <self>
            <h1.title> "Welcome"
            <p.desc> "I am a component"
```

The custom component above compiles to the follow js:

```javascript
var Component = Imba.defineTag('Component', function(tag){
    tag.prototype.render = function (){
        var $ = this.$;
        return this.setChildren($.$ = $.$ || [
            createElement('h1',$,0,this).flag('title').setText("Welcome"),
            createElement('p',$,1,this).flag('desc').setText("I am a component")
        ]).synced();
    };
});
```

If you look closely here, you will see that the first time render is called, the two children will be created, and their attributes will be set. The next time render is called, the children-array will already be cached, so nothing will happen. This is okay since there is no dynamic content or attributes.

So what would happen if we add a dynamic attribute?

```imba
tag Component
    def render
        <self>
            <h1.title> "Welcome"
            # Include 'red' className 50% of the time, randomly
            <p.desc .red=(Math.random > 0.5)> "Roulette"
```

compiles to

```javascript
var Component = Imba.defineTag('Component', function(tag){
    tag.prototype.render = function (){
        var $ = this.$;
        return this.setChildren($.$ = $.$ || [
            _1('h1',$,0,this).flag('title').setText("Welcome"),
            _1('p',$,1,this).flag('desc').setText("Roulette")
        ],2).synced((
            $[1].flagIf('red',Math.random() > 0.5)
        ,true));
    };
});
```

Now, the elements will be created the upon the first render, but the dynamic part has been moved out of the cached children, and is executed on every render. This is the core concept Imba uses for it's lightning fast rendering. Albeit more complex, the same concept is used for conditionals, loops, and everything else inside tag trees.

```imba
tag Component
    def render
        <self>
            <h1.title> "Welcome"
            <p.desc .red=(Math.random > 0.5)> "Roulette"
            <ul.list> for item in data
                <TodoItem> item
```

compiles to

```javascript
var Component = Imba.defineTag('Component', function(tag){
    tag.prototype.render = function (){
        var $ = this.$, self = this;
        return self.$open(0).setChildren($.$ = $.$ || [
            _1('h1',$,0,self).flag('title').setText("Welcome"),
            _1('p',$,1,self).flag('desc').setText("Roulette"),
            _1('ul',$,2,self).flag('list')
        ],2).synced((
            $[1].flagIf('red',(Math.random() > 0.5)),
            $[2].setContent((function($0) {
                for (let i = 0, ary = self.data(), len = $0.taglen = ary.length; i < len; i++) {
                    ($0[i] || _1(TodoItem,$0,i)).setContent(ary[i],3).end();
                };return $0;
            })($[3] || _2($,3,$[2])),4)
        ,true));
    };
});
```

When looking at the compiled output for more complicated tags it's beginning to make sense that the approach would be difficult without a compile-to-js language. Still, the concept is very simple, and it is what allows Imba to be an order of magnitude faster than the popular frameworks out there today.
