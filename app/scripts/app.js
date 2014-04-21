'use strict';

/*exported app */
var app = angular.module('yeomanApp', ['ngCookies', 'ngResource', 'ngSanitize', 'ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/home');

    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'views/home.html'
        })
        .state('about', {
            abstract: true,
            url: '/about',
            template: '<ui-view/>'
        })
        .state('about.list', {
            url: '',
            templateUrl: 'views/about.html',
            controller: 'AboutCtrl'
        })
        .state('about.detail', {
            url: '/:name',
            templateUrl: 'views/aboutdetail.html',
            controller: 'AboutDetailCtrl'
        })
        .state('contact', {
            url: '/contact',
            templateUrl: 'views/contact.html',
            controller: 'ContactCtrl'
        })
        .state('profile', {
            url: 'profile',
            templateUrl: 'views/profile.html',
            controller: 'ProfileCtrl'
        })
    ;
}]);

app.run(function($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
});

app.service('GitHubService', function($http) {
    var self = {
        getRepos: function () {
            var url = 'https://api.github.com/users/jankeesvanandel/repos?callback=JSON_CALLBACK';
            return $http.jsonp(url).then(function (response) {
                return response.data.data;
            });
        },
        getRepoByName: function(name) {
            return self.getRepos().then(function(response) {
                var data = response;
                for (var i = 0; i < data.length; i++) {
                    var obj = data[i];
                    if (obj.name === name) {
                        return obj;
                    }
                }
                throw new Error('Cannot find repo with name: ' + name);
            });
        }
    };
    return self;
});
