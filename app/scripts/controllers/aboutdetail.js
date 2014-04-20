'use strict';

/* global app */
app.controller('AboutDetailCtrl', function ($scope, $stateParams, GitHubService) {
    GitHubService.getRepoByName($stateParams.name)
        .then(function (data) {
            var map = [], i = 0;
            for (var obj in data) {
                if (data.hasOwnProperty(obj)) {
                    map[i++] = {
                        name: obj,
                        value: data[obj]
                    };
                }
            }
            $scope.repo = map;
        }, function (data) {
            console.error('Error calling service: ' + data);
        });
});

