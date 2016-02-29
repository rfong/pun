var app = angular.module('PunApp', []);


app.controller('PunCtrl', function($scope, $http) {
  $scope.results = [];

  // Set default value at hash[key] if it does not exist.
  $scope.setDefault = function(hash, key, defaultValue) {
    hash[key] = _.isUndefined(hash[key]) ? defaultValue : hash[key];
  };

  $.getJSON('assets/ipa.json',function(data){
    $scope.ipa = data;
    $scope.words = _.keys($scope.ipa);
    $scope.ipaValues = _.values($scope.ipa);
    $scope.reverseIpa = {};
    _.each($scope.ipa, function(ipaValue, word) {
      $scope.setDefault($scope.reverseIpa, ipaValue, []);
      $scope.reverseIpa[ipaValue].push(word);
    });
    //$scope.ipaSubstringTrie = new SubstringTrie($scope.ipaValues);
  });
  $.getJSON('assets/ipaVowels.json',function(data){
    $scope.ipaVowels = data.ipaVowels;
  });

  $scope.callOnEnter = function(callback, e) {
    if (e.keyCode === 13) {
      callback();
    }
  };

  $scope.getSuperstrings = function(query) {
    return _.filter($scope.words, function(word) {
      return word.includes($scope.query);
    });
  };

  $scope.getPhoneticSuperstrings = function(ipaQuery) {
    return $scope.ipasToWords(
      _.filter($scope.ipaValues, function(ipa) {
        return ipa.includes(ipaQuery);
      })
      //$scope.ipaSubstringTrie.lookup(ipaQuery)
    );
    // Note: using a substring trie lookup instead of a filter drops most
    // queries from 60ms to 6ms, but the initial construction takes 1.5s
    // and freezes the browser pretty bad.
  };

  $scope.ipasToWords = function(ipas) {
    return (_.chain(ipas)
      .map(function(ipa) { return $scope.reverseIpa[ipa] || [] })
      .flatten()
      .uniq()
    ).value();
  };

  $scope.makeQuery = function() {
    if (_.isUndefined($scope.ipa[$scope.query])) {
      $scope.results = undefined;
      $scope.error = 'pronunciation not found';
      return;
    }
    var time = performance.now();
    $scope.results = (
      _.chain($scope.getSimilar($scope.query))
      .map(function(query) {
        return $scope.getPhoneticSuperstrings(query);
      })
      .flatten(true)
      .uniq()
      .value()
    ).sort();
    $scope.error = ($scope.results.length == 0) ? "No matches found" : undefined;
    console.log($scope.query, performance.now() - time);
  };

  // vowel substitutions
  $scope.getSimilar = function(word) {
    var similar = [],
        pronunciation = $scope.ipa[word];
    _.each(pronunciation, function(c) {
      if ($scope.ipaVowels.includes(c)) {
        similar = similar.concat(
          _.map($scope.ipaVowels, function(vowel) {
            return pronunciation.replace(c, vowel);
          })
        );
      }
    });
    return _.uniq(similar);
  };

});
