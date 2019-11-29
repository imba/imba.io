---
title: Form Input Bindings
order: 6
---

# Form Input Bindings

## Basic Usage

### Text

```imba
var store = {message: ""}
Imba.mount <section ->
    <input[store:message]>
    <div> "Message is {store:message}"
```


### Range

```imba
var data = {counter: 50}
Imba.mount <div ->
    <input[data:counter] type='range' min=0 max=100 step=1>
    <div> "Count is {data:counter}"
```


### Checkbox

```imba
var store = {
    message: ""
    enabled: false
}
Imba.mount <div.grid ->
    <input[store:enabled] type='checkbox'>
    <span> "enabled: {store:enabled}"
```

### Multiple checkboxes
```imba
var data = {skills: ["Literacy"]}
Imba.mount <div ->
    <header.bar> for option in ['React','Vue','Imba','Angular','Ember']
        <label.pill>
            <input[data:skills] type='checkbox' value=option>
            <span> option
    <div> "Your skills: {data:skills.join(", ")}"
```


### Select & Radio

```imba
var options = ['React','Vue','Imba','Angular','Ember']
var data = {choice: null}

Imba.mount <div ->
    # binding select to choice
    <select[data:choice]> for item in options
        <option> item

    # render an input radio for every option
    <header.bar> for item in options
        <label.pill>
            <input[data:choice] type='radio' value=item>
            <span> item
```

### Rich values

```imba

var options = [
    { name: 'React', url: "reactjs.org" }
    { name: 'Vue', url: "vuejs.org" }
    { name: 'Imba', url: "imba.io" }
    { name: 'Angular', url: "angular.io" }
]

var data = {choice: ""}

Imba.mount <div ->
    # binding select to rich objects
    <select[data:choice]>
        <option disabled value=""> "Please select one"
        for item in options
            <option value=item> item:name

    if let framework = data:choice
        <div>
            <h2> "Framework of choice:"
            <div> "{framework:name} ({framework:url})"
```

### Example

```imba

var store =
    people: [{
        name: ""
        skills: ["Curiosity","Literacy"]
        confirmed: false
    }]

tag Form < form    
    prop confirmed
    prop person

    def addSkill e
        person:skills.push(e.target.value)
        e.target.value = ''

    def onsubmit e
        e.prevent
        window.alert("Submitted!")

    def render
        <self>
            <input[person:name] type='text' placeholder="Your name...">
            <input placeholder="Add skill..." :keyup.enter.prevent.addSkill>
            <div.bar> for skill in person:skills
                <label.pill>
                    <input[person:skills] type='checkbox' value=skill>
                    <span> skill
            <footer>
                <label.pill>
                    <input[confirmed] type='checkbox'>
                    <span> "I, {person:name or "Unnamed"}, confirm this"
                <button disabled=!confirmed> "Submit Form"

Imba.mount <Form person=store:people[0]>
```

