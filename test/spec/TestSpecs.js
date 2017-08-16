describe('Glider(x) wrapper', function() {
  it('returns an ArraySequence when passed an Array', function() {
    expect(Glider(this.numArray).constructor.name)
      .toBe('ArraySequence');
  });

  it('returns a GlideRecordSequence when passed a GlideRecord', function() {
    expect(Glider(new GlideRecord('incident')).constructor.name)
      .toBe('GlideRecordSequence');
  });

  it('returns a GlideRecordSequence when passed a table name and encoded query as strings', function() {
    expect(Glider('incident', 'short_description=Glider Test').constructor.name)
      .toBe('GlideRecordSequence');
  });
});

describe('Glider(x).value()', function() {
  it('iterates an ArraySequence, returning an Array of resulting values', function() {
    expect(Glider(this.numArray).value())
      .toEqual(this.numArray);
  });

  it('can not return GlideRecord as a value', function() {
    pending('trivial to implement but seems pointless');
  });
});

describe('Glider(x).reduce(callback)', function() {
  beforeEach(function() {
    this.reduceCallback = function(accum, el) {
      return accum + el;
    };
  });

  it('reduces an ArraySequences values to a single value', function() {
    expect(Glider(this.numArray).reduce(this.reduceCallback))
      .toBe(this.numArray.reduce(this.reduceCallback));
  });

  it('reduces an ArraySequences values using an initial value', function() {
    expect(Glider(this.numArray).reduce(this.reduceCallback, 5))
      .toBe(this.numArray.reduce(this.reduceCallback, 5));
  });

  it('can not reduce a GlideRecordSequences values without an initial value', function() {
    pending('an initial value is required in certain circumstances (non-numeric arrays)');
  });

  it('reduces a GlideRecordSequences values using an initial value', function() {
    // Expect
    var result = Glider('incident', 'short_description=Glider Test')
      .reduce(function(accum, gr) {
        console.log(gr.priority);
        return accum + (gr.priority * 1);
      }, 6);

    // To be
    var val = 6,
      gr = new GlideRecord('incident');

    gr.addEncodedQuery('short_description=Glider Test');
    gr.query();
    while (gr.next()) {
      val += (gr.priority * 1);
    }

    expect(result).toBe(val);
  });
});

describe('Glider(x).forEach(callback)', function() {
  beforeEach(function() {
    var self = this;
    this.result = [];
    this.eachCallback = function(el) {
      self.result.push(el);
    };
  });

  it('iterates an ArraySequence', function() {
    Glider(this.numArray).forEach(this.eachCallback);

    expect(this.result)
      .toEqual(this.numArray);
  });

  it('iterates a GlideRecordSequence', function() {
    // Expect
    var result = [];
    Glider('incident', 'short_description=Glider Test')
      .forEach(function(gr) {
        result.push(gr.short_description + '');
      });

    // To Be
    var arr = [],
      gr = new GlideRecord('incident');

    gr.addEncodedQuery('short_description=Glider Test')
    gr.query();
    while (gr.next()) {
      arr.push(gr.short_description + '');
    }

    expect(result).toEqual(arr);
  });
})

describe('Glider(x).map(callback)', function() {
  beforeEach(function() {
    this.mapCallback = function(el, ix) {
      return el + 1;
    };

    this.grMapCallback = function(gr, ix) {
      return gr.short_description + '';
    }
  });

  it('returns a MapSequence', function() {
    expect(Glider(this.numArray).map(this.mapCallback).constructor.name)
      .toBe('MapSequence');
  });

  it('maps over an ArraySequence when a terminal call is made', function() {
    expect(Glider(this.numArray).map(this.mapCallback).value())
      .toEqual(this.numArray.map(this.mapCallback));
  });

  it('maps over a GlideRecordSequence', function() {
    // Expect
    var result = Glider('incident', 'short_description=Glider Test').map(this.grMapCallback).value();

    // To be
    var arr = [],
      gr = new GlideRecord('incident');

      gr.addEncodedQuery('short_description=Glider Test');
      gr.query();
      while (gr.next()) {
        arr.push(gr.short_description + '');
      }

    expect(result)
      .toEqual(arr);
  });
});

describe('Glider(x).filter(callback)', function() {
  beforeEach(function() {
    this.filterCallback = function(el) {
      return el <= 5;
    };
  });

  it('returns a FilterSequence', function() {
    expect(Glider(this.numArray).filter(this.filterCallback).constructor.name)
      .toBe('FilterSequence');
  });

  it('filters an ArraySequence when a terminal call is made', function() {
    expect(Glider(this.numArray).filter(this.filterCallback).value())
      .toEqual(this.numArray.filter(this.filterCallback));
  });

  it('filters a GlideRecordSequence when a terminal call is made', function() {
    // Expect
    var result = Glider('incident', 'short_description=Glider Test')
      .filter(function(gr) {
        return ((gr.priority * 1) == 1);
      })
      .map(function(gr) {
        return gr.short_description + '';
      })
      .value();

    // To be
    var arr = [],
      gr = new GlideRecord('incident');

    gr.addEncodedQuery('short_description=Glider Test');
    gr.query();

    while (gr.next()) {
      if ((gr.priority * 1) != 1) {
        continue;
      }

      arr.push(gr.short_description + '');
    }

    expect(result).toEqual(arr);
  });
});

describe('Glider(x).chunk(number)', function() {
  beforeEach(function() {
    this.vanillaChunk = function(arr, size) {
      var result = [];

      while (arr.length > 0) {
        result.push(arr.splice(0, size));
      }

      return result;
    }
  });

  it('returns a ChunkSequence', function() {
    expect(Glider(this.numArray).chunk(5).constructor.name)
      .toBe('ChunkSequence');
  });

  it('splits an ArraySequence into chunks of the specified size', function() {
    expect(Glider(this.numArray).chunk(5).value())
      .toEqual(this.vanillaChunk(this.numArray, 5));
  });

  it('yields a smaller final chunk if there are fewer values than the chunk size', function() {
    expect(Glider(this.numArray).chunk(3).value())
      .toEqual(this.vanillaChunk(this.numArray, 3));
  });

  it('yields a ChunkItemSequence when iterated', function() {
    var seq = Glider(this.numArray).chunk(3);
    seq.next();
    expect(seq.current().constructor.name)
      .toBe('ChunkItemSequence');
  });

  it('splits a GlideRecordSequence into chunks of the specified size', function() {
    // Expect
    var result = [];
    Glider('incident', 'short_description=Glider Test')
      .chunk(5)
      .forEach(function(chunk) {
        var chunkArr = [];
        chunk.forEach(function(gr) {
          chunkArr.push(gr.short_description + '');
        });
        result.push(chunkArr);
      });

    // To be
    var arr = [],
      chunkSize = 5,
      chunk = [],
      gr = new GlideRecord('incident');

    gr.addEncodedQuery('short_description=Glider Test');
    gr.query();
    while (gr.hasNext()) {
      while (chunk.length < chunkSize && gr.next()) {
        chunk.push(gr.short_description + '');
      }
      arr.push(chunk);
      chunk = [];
    }

    expect(result).toEqual(arr);
  });
})
