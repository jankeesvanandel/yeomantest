'use strict';

/* global app */
app.controller('AboutCtrl', function ($scope, GitHubService) {
    GitHubService.getRepos()
        .then(function (data) {
            console.log(data);
            $scope.repos = data;
        }, function (data) {
            console.error('Error calling service: ' + data);
        });
});

