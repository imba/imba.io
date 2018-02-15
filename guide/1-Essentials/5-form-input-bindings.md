---
title: Form Input Bindings
order: 5
---

# Form Input Bindings

## Basic Usage

### Text

```imba
var data = {message: ""}
Imba.mount <section[data] ->
    <input model='message'>
    <div> "Message is {data:message}"
```

### Checkbox

```imba
var data = {
    message: ""
    enabled: false
}
Imba.mount <div[data].grid ->
    <input type='checkbox' model='enabled'>
    <span> "enabled: {data:enabled}"
```

### Multiple checkboxes
```imba
const data = {skills: ["Literacy"]}
Imba.mount <div[data] ->
    <header.bar> for option in ['React','Vue','Imba','Angular','Ember']
        <label.pill>
            <input type='checkbox' model='skills' value=option>
            <span> option
    <div>
        "Your skills: {data:skills.join(", ")}"
```


### Radio

### Select

### Range

```imba
var data = {counter: 50}
Imba.mount <div[data] ->
    <input type='range' min=0 max=100 step=1 model='counter'>
    <div> "Count is {data:counter}"
```

### Example

```imba

var person =
    name: ""
    skills: ["Curiosity","Literacy"]
    confirmed: false

tag Form < form
    
    def addSkill e
        data:skills.push(e.target.value)
        e.target.value = ''

    def onsubmit e
        e.prevent
        window.alert("Submitted!")

    def render
        <self>
            <input type='text' placeholder="Your name..." model.trim='name'>
            <input placeholder="Add skill..." :keyup.enter.addSkill>
            <.bar> for skill in data:skills
                <label.pill>
                    <input type='checkbox' model='skills' value=skill>
                    <span> skill
            <footer>
                <label.pill>
                    <input type='checkbox' model='confirmed'>
                    <span> "I, {data:name or "Unnamed"}, confirm this"
                <button disabled=!data:confirmed> "Submit Form"

Imba.mount <Form[person]>
```