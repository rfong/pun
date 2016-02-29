/* Run a simpleserver (python -m SimpleHTTPServer 8001) and hit index.html
   to run; requires underscore.js import.
 */

var _end = '_END';

var SubstringTrie = function(words) {
  var self = this;
  this._trie = {};

  this.initialize = function() {
    _.each(words, function(word) {
      for (var start in _.range(word.length)) {
        current_dict = self._trie;
        for (var i=start; i<word.length; i++) {
          letter = word[i];
          current_dict[letter] = (_.isUndefined(current_dict[letter]) ?
                                  {} : current_dict[letter]);
          current_dict = current_dict[letter];
          if (_.isUndefined(current_dict[_end])) {
            current_dict[_end] = [];
          }
          current_dict[_end].push(word);
        }
      }
    });
  };

  // Given a subtrie, get all values keyed to _END
  this.get_leaves = function(trie) {
    if (_.isUndefined(trie)) {
      trie = self._trie;
    }
    var leaves = [];
    _.each(_.keys(trie), function(letter) {
      if (letter === _end) {
        leaves = leaves.concat(trie[_end]);
      } else {
        leaves = leaves.concat(self.get_leaves(trie[letter]));
      }
    });
    return _.uniq(leaves);
  };

  // Fetch all values with `substring` as a substring
  this.lookup = function(substring) {
    var curr = self._trie;
    for (var i in substring) {
      curr = curr[substring[i]] || {};
    }
    return self.get_leaves(curr);
  }

  this.initialize();
};

var PrefixTrie = function(words) {
  var self = this;
  this._trie = {};

  this.initialize = function() {
    var current_dict;
    _.each(words, function(word) {
      current_dict = self._trie;
      _.each(word, function(letter) {
        current_dict[letter] = current_dict[letter] || {};
        current_dict = current_dict[letter];
      });
      current_dict[_end] = _end;
    });
  };

  this.lookup = function(prefix) {
    var curr_trie = self._trie;
    for (i in prefix) {
      curr_trie = self._trie[prefix[i]];
      if (!curr_trie) {
        return null;
      }
    }
    return self._prepend_to_paths(prefix, self.get_paths(curr_trie));
  };

  this.get_paths = function(curr_trie) {
    if (!curr_trie) {
      curr_trie = self._trie;
    }
    var paths = [];
    _.each(curr_trie, function(subtrie, letter) {
      if (letter == _end || typeof subtrie === 'string') {
        paths.push('');
      }
      else if (subtrie) {
        paths = paths.concat(
          self._prepend_to_paths(letter, self.get_paths(subtrie)));
      }
    });
    return paths;
  };

  this._prepend_to_paths = function(prefix, paths) {
    return _.map(paths, function(path) { return prefix + path; });
  };

  this.initialize();
};

/*
var words = ['a', 'apple', 'aardvark', 'application', 'abacus', 'abacuses', 'xylophone', 'symurgy', 'zymolytic', 'zymometer', 'zygote', 'zygotes', 'zygoma', 'zygomas'];
var trie = new PrefixTrie(words);
console.log(trie);
console.log(trie.lookup(''));
console.log(trie.lookup('a'));
console.log(trie.get_paths());


var trie = new SubstringTrie(words);
console.log(trie);
console.log(trie.get_leaves())
*/
