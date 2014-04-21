'use strict';

/*exported app */
var app = angular.module('yeomanApp', ['ngCookies', 'ngResource', 'ngSanitize', 'ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/home');

    var rootState = $stateProvider.state('rootState', {
        abstract: true,
        template: '<ui-view/>',
        resolve: {
            authorize: function (AuthorizationService) {
                return AuthorizationService.authorize();
            }
        }
    });
    $stateProvider
        .state('home', {
            parent: 'rootState',
            url: '/home',
            templateUrl: 'views/home.html'
        })
        .state('about', {
            parent: 'rootState',
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
            parent: 'rootState',
            url: '/contact',
            templateUrl: 'views/contact.html',
            controller: 'ContactCtrl'
        })
        .state('profile', {
            parent: 'rootState',
            url: 'profile',
            templateUrl: 'views/profile.html',
            controller: 'ProfileCtrl'
        })
    ;
}]);

app.run(function($rootScope, $state, $stateParams, CurrentUser) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
        $rootScope.toState = toState;
        $rootScope.toStateParams = toStateParams;
        if (CurrentUser.isAuthenticated()) {
            CurrentUser.autoLogin();
        }
    });
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

app.service('CurrentUser', function CurrentUser($q, $http, $timeout) {
    var dummyUser = {
        name: 'jankeesvanandel',
        realName: 'Jan-Kees va n Andel',
        roles: ['admin', 'user']
    };
    var self = {
        _user: undefined,
        _isAuthenticated: false,
        isAuthenticated: function () {
            return self._isAuthenticated && angular.isDefined(self._user);
        },
        hasRole: function (role) {
            if (!self.isAuthenticated) {
                return false;
            }
            return self._user.roles.indexOf(role) !== -1;
        },
        autoLogin: function () {
            var deferred = $q.defer();
            if (self.isAuthenticated()) {
                deferred.resolve(self._user);
            } else {
                $timeout(function () {
                    self._user = dummyUser;
                    deferred.resolve(self._user);
                }, 0);
            }

            return deferred.promise;
        },
        authenticate: function (username, password) {
            console.log(username + password);
            var deferred = $q.defer();
            if (self.isAuthenticated()) {
                deferred.resolve(self._user);
            } else {
                $timeout(function () {
                    self._user = dummyUser;
                    deferred.resolve(self._user);
                }, 0);
            }

            return deferred.promise;
        }
    };
    return {
        isAuthenticated: self.isAuthenticated,
        hasRole: self.hasRole,
        autoLogin: self.autoLogin,
        authenticate: self.authenticate
    };
});

app.factory('AuthorizationService', function AuthorizationService($rootScope, $state, CurrentUser) {
    return {
        authorize: function() {
            return CurrentUser.autoLogin()
                .then(function() {
                    if ($rootScope.toState && $rootScope.toState.data) {
                        var roles = $rootScope.toState.data.roles;
                        if (roles && roles.length > 0 && !CurrentUser.hasAllRoles(roles)) {
                            if (CurrentUser.isAuthenticated()) {
                                $state.go('accessdenied');
                            } else {
                                $rootScope.returnToState = $rootScope.toState;
                                $rootScope.returnToStateParams = $rootScope.toStateParams;
                                $state.go('login');
                            }
                        }
                    }
                });
        }
    };
});
