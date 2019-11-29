---
title: The Scheduler in Imba
order: 5
---

# The Scheduler in Imba

### `scheduler.mark`

Mark the scheduler to tick in the next frame. This is asynchronous, so you can call it a thousand times during one 'tick' in your application, and it will only call once in the next tick. This is useful if you want to make sure that some tag is rendered asynchronously as soon as possible.

```text
tag App
    def load
        data = await fetchDataFromServer
        scheduler.mark # render asap
```

## Configuring

Scheduler has 3 different modes

* raf - tick on every animation frame - usually 60 fps
* events - tick after any handled dom event / call to Imba.commit
* interval - tick ever n milliseconds

> If you call Imba.commit 100 times, or trigger 1000 custom events synchronously, the schedulers will still only tick once, the next frame.

## How to schedule tags

By default, any tag mounted through `Imba.mount` will be scheduled with `configure(events: true)`. Scheduling tags manually should happen in their mount method.

> Usually, you will only schedule the very root tag in your application.

