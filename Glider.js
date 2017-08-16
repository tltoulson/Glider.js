var Glider = (function() {
  function Sequence() {}

  Sequence.prototype.forEach = function(callback) {
    var el;

    while (this.next()) {
      el = this.current();
      callback(el);
    }
  };

  Sequence.prototype.map = function(callback) {
    return new MapSequence(this, callback);
  };

  Sequence.prototype.filter = function(filterFn) {
    return new FilterSequence(this, filterFn);
  };

  Sequence.prototype.value = function() {
    var vals = [];

    this.forEach(function(el) {
      vals.push(el);
    });

    return vals;
  };

  Sequence.prototype.reduce = function(callback, initialValue) {
    var accum = initialValue,
      temp;

    if (accum === undefined && this.next()) {
      accum = this.current();
    }

    this.forEach(function(el) {
      accum = callback(accum, el);
    });

    return accum;
  };

  Sequence.prototype.chunk = function(size) {
    return new ChunkSequence(this, size);
  };

  function GlideRecordSequence(table, query) {
    if (query) {
      this.gr = new GlideRecord(table);
      this.gr.addEncodedQuery(query);
    }
    else {
      this.gr = table;
    }

    this.gr.query();
  }

  GlideRecordSequence.prototype = Object.create(Sequence.prototype);
  GlideRecordSequence.prototype.constructor = GlideRecordSequence;

  GlideRecordSequence.prototype.next = function() {
    return this.gr.next();
  };

  GlideRecordSequence.prototype.current = function() {
    return this.gr;
  };

  function ArraySequence(arr) {
    this.parent = this;
    this.ix = -1;
    this.arr = arr;
  }

  ArraySequence.prototype = Object.create(Sequence.prototype);
  ArraySequence.prototype.constructor = ArraySequence;

  ArraySequence.prototype.next = function() {
    this.ix++;
    return this.ix < this.arr.length;
  };

  ArraySequence.prototype.current = function() {
    return this.arr[this.ix];
  };

  function MapSequence(parent, callback) {
    this.parent = parent;
    this.ix = -1;
    this.callback = callback;
  }

  MapSequence.prototype = Object.create(Sequence.prototype);
  MapSequence.prototype.constructor = MapSequence;

  MapSequence.prototype.next = function() {
    this.ix++;
    return this.parent.next();
  };

  MapSequence.prototype.current = function() {
    return this.callback(this.parent.current(), this.ix);
  };

  function FilterSequence(parent, callback) {
    this.parent = parent;
    this.callback = callback;
    this.el = undefined;
  }

  FilterSequence.prototype = Object.create(Sequence.prototype);
  FilterSequence.prototype.constructor = FilterSequence;

  FilterSequence.prototype.next = function() {
    while (this.parent.next()) {
      this.el = this.parent.current();
      if (this.callback(this.el)) {
        return true;
      }
    }

    return false;
  };

  FilterSequence.prototype.current = function() {
    return this.el;
  };

  function ChunkSequence(parent, size) {
    this.parent = parent;
    this.size = size;
  }

  ChunkSequence.prototype = Object.create(Sequence.prototype);
  ChunkSequence.prototype.constructor = ChunkSequence;

  ChunkSequence.prototype.next = function() {
    return this.parent.next();
  };

  ChunkSequence.prototype.current = function() {
    return new ChunkItemSequence(this, this.size);
  };

  ChunkSequence.prototype.value = function() {
    var vals = [];

    this.forEach(function(chunk) {
      vals.push(chunk.value());
    });

    return vals;
  };

  function ChunkItemSequence(parent, size) {
    this.parent = parent;
    this.remaining = size;
    this.first = true;
  }

  ChunkItemSequence.prototype = Object.create(Sequence.prototype);
  ChunkItemSequence.prototype.constructor = ChunkItemSequence;

  ChunkItemSequence.prototype.next = function() {
    if (this.first) {
      this.first = false;
      this.remaining--;
      return true;
    }

    if (this.remaining-- && this.parent.next()) {
      return true;
    }

    return false;
  };

  ChunkItemSequence.prototype.current = function() {
    return this.parent.parent.current();
  };

  function CollectionWrapper(col, query) {
    if (Array.isArray(col)) {
      return new ArraySequence(col);
    }
    else if (col.toString() == '[object GlideRecord]' || col.toString() == '[object ScopedGlideRecord]') {
      return new GlideRecordSequence(col);
    }
    else if (query && typeof col == 'string') {
      return new GlideRecordSequence(col, query);
    }
    else {
      throw 'Collection is not recognized as a GlideRecord or Array';
    }
  }

  return CollectionWrapper;
})();
