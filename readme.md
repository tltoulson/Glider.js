# Like Lodash for GlideRecord

**NOTE: This library is currently experimental, use in production with caution**

Glider.js is a utility library for Javascript, similar to [Lodash](http://lodash.com/) and [Underscore](http://underscorejs.org/), that is specifically designed to work with GlideRecords (but will also work with Arrays and other collections) on the ServiceNow platform.  Glider is largely inspired by [Lazy.js](http://danieltao.com/lazy.js/) and uses lazy evaluation to improve loop performance and ensure consistency with GlideRecords.

To get started, you should install Glider.js as a Script Include.  The following options are available:

**Global Scope Script Include**

Grab the Glider Update Set.xml Update Set under the dist folder and install it in your ServiceNow instance to create the Glider Script Include in the global scope.

**Scoped Application Script Include**

Create a new Script Include called "Glider" in your ServiceNow Scoped Application.  Paste the contents of the Glider.js or the Glider.min.js file directly into the Script Include script field and save the record.

## Introduction

If you are familiar with Lodash syntax, Glider will be quite familiar but for the uninitiated let's take a look at the advantages of the Glider syntax:

```js
Glider('incident', 'active=true')
  .filter(function(gr) { return gr.canRead(); })
  .map(function(gr) {
    return {
      'short_description': gr.short_description + ''
    };
  })
  .value();
```

The equivalent vanilla GlideRecord loop approach would look something like this:

```js
var gr = new GlideRecord('incident'),
  arr = [],
  obj;

gr.addEncodedQuery('active=true');
gr.query()

while(gr.next()) {  
  if (gr.canRead()) {
    obj = {
      'short_description': gr.short_description + ';'
    };

    arr.push(obj);
  }
}
```

You'll note that Glider gets rid of the GlideRecord boilerplate and global variables.  But we can actually clean up Glider even more by extracting some of those callbacks:

```js
function canRead(gr) {
  return gr.canRead();
}

function buildIncidentObj(gr) {
  return {
    'short_description': gr.short_description + '';
  }
}

Glider('incident', 'active=true')
  .filter(canRead)
  .map(buildIncidentObject)
  .value();
```

By extracting the callback functions, we can easily read the entire collection pipeline and understand its process.  Moving the callbacks into their own Script Includes (such as canRead) additionally make those calls reusable in other Glider scripts in the instance.

It's much more complicated to yield these same improvements on vanilla GlideRecord loops, especially as the nested depth of loops and if statements increase.  Additionally, extraction can have unintended consequences on while loop flow control since statements such as **break** and **continue** have no meaning once removed from the loop.

## Features

### GlideRecordSequence Iteration

```js
Glider('incident', 'active=true')
  .map(function(gr) { return gr.short_description + '';})
  .value();
// returns an array of short description strings such as ['test', 'my computer is broken', 'etc']
```

### ArraySequence Iteration

```js
Glider([1,2,3,4,5,6])
  .map(function(el) { return el + 1; })
  .value();
// returns an array [2,3,4,5,6,7]
```

### Pipeline Functions

Pipeline functions return Sequence objects which can be chained together in order to lazily process the items in the collection passed to Glider.

- .map(callback) - Generates a sequence by executing the callback on each item and yielding the returned value
- .filter(callback) - Generates a sequence by executing the callback on each item and yielding only values where the callback returns true
- .chunk(size) - Breaks the sequence into chunks of the specified size by yielding one ChunkItemSequence at a time.  The ChunkItemSequence can be iterated using Glider functions to yield the items in the chunk.

### Terminal Functions

Terminal functions end a Sequence, execute the Pipeline functions, and return a value.

- .value() - Returns an array of processed values
- .forEach(callback) - Iterates the sequences, passing each processes value to the callback
- .reduce(callback, initial) - Reduces the iterated sequence of values by passing each value to the callback (using an optional initial value) and returning a single accumulated value

***

**REMINDER:** This library is currently experimental.  Expect bugs and failures at this point.
