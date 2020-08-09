# css modifiers

Modifiers are css [pseudo-classes](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes) with superpowers. They can be used in selectors wherever you would normally use a pseudo-class. All css pseudo-classes are available as modifiers, but Imba offers additional modifiers to make responsive styling easy, as well as a ton of other convenient modifiers you can read about further down.

##### in selectors
```imba
css button@hover
    bg:blue
```

##### in properties
```imba
css button
    bg@hover:blue
```

##### after properties
```imba
css button
    bg:white @hover:whitesmoke @focus:blue
```

##### class modifiers
```imba
css button
    bg:white .primary:blue ..busy:gray
```

## Reference

<doc-style-modifiers></doc-style-modifiers>