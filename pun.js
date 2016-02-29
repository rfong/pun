var app = angular.module('PunApp', []);


app.controller('PunCtrl', function($scope, $http) {
  $scope.results = [];

  $.getJSON('assets/ipa.json',function(data){
    $scope.ipa = data;
    $scope.words = _.keys($scope.ipa);
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
      _.filter(_.values($scope.ipa), function(ipa) {
        return ipa.includes(ipaQuery);
      })
    );
    // todo: compare lookup speed with trie instead of filter
  };

  $scope.ipasToWords = function(ipas) {
    return _.filter($scope.words, function(word) {
      return _.contains(ipas, $scope.ipa[word]);
    });
    // todo: probably faster to store a reverse lookup
  };

  $scope.makeQuery = function() {
    if (_.isUndefined($scope.ipa[$scope.query])) {
      $scope.results = undefined;
      $scope.error = 'pronunciation not found';
      return;
    }
    $scope.results = (
      _.chain($scope.getSimilar($scope.query))
      .map(function(query) {
        return $scope.getPhoneticSuperstrings(query);
      })
      .flatten(true)
      .uniq()
      .value()
    ).sort();
    $scope.error = undefined;
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
