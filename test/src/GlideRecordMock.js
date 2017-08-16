function GlideRecord(table) {
  this.incidents = [
    { 'priority': 1, 'short_description': 'Glider Test' },
    { 'priority': 1, 'short_description': 'Glider Test' },
    { 'priority': 2, 'short_description': 'Glider Test' },
    { 'priority': 2, 'short_description': 'Glider Test' },
    { 'priority': 3, 'short_description': 'Glider Test' },
    { 'priority': 3, 'short_description': 'Glider Test' },
    { 'priority': 3, 'short_description': 'Glider Test' },
    { 'priority': 4, 'short_description': 'Glider Test' },
    { 'priority': 4, 'short_description': 'Glider Test' },
    { 'priority': 5, 'short_description': 'Glider Test' }
  ];

  this.current = -1;
}

GlideRecord.prototype.toString = function() {
  return '[object GlideRecord]';
}

GlideRecord.prototype.hasNext = function() {
  return (this.current + 1 < this.incidents.length);
}

GlideRecord.prototype.next = function() {
  var key,
    inc;
  this.current++;

  if (this.current < this.incidents.length) {
    inc = this.incidents[this.current];
    for (key in inc) {
      this[key] = inc[key];
    }
    return true;
  }

  return false;
}

GlideRecord.prototype.addEncodedQuery = function(encQuery) {
  // noop
}

GlideRecord.prototype.query = function() {
  // noop
}
