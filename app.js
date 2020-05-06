angular.module('BOSapiclient', ['ngMaterial', 'ngMessages'])
    .config(['$qProvider', function ($qProvider) {
        $qProvider.errorOnUnhandledRejections(false);
    }])

    .run(['$rootScope', '$http', function ($rootScope, $http) {
        $http.get('config.json?_=' + Date.now(), { cache: false }).then(function (data) {
            $rootScope.config = data.data;
            $rootScope.wsip = $rootScope.config[0].wsip;
            $rootScope.usr = $rootScope.config[0].username;
            $rootScope.pwd = $rootScope.config[0].password;
        });
    }])
    .controller('deviceController', ['$scope', '$rootScope', '$http', '$mdDialog', function ($scope, $rootScope, $http, $mdDialog, ) {
        $http.get('miners.json?_=' + Date.now(), { cache: false }).then(function (data) {
            $scope.miners = data.data;
            console.log($scope.miners)
        });
        /* start dialog */
        $scope.status = '  ';
        $scope.fetchapi = function (ev, index) {
            $mdDialog.show({
                locals: { dataToPass: $scope.miners[index] },
                controller: devController,
                templateUrl: 'detail.tmpl.html',
                parent: angular.element(document.querySelector('#popupContainer')),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: false,
                preserveScope: true
            })
        };
        function devController($scope, $mdDialog, dataToPass) {
            $scope.device = dataToPass;
            console.log($scope.device)
            $scope.hide = function () {
                $mdDialog.hide();
            };

            //fetch api from device
            $http({
                method: 'GET',
                url: $rootScope.wsip + $scope.device.ip + '/cgi-bin/luci/admin/miner/api_status/',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Credentials': true,
                    'Authorization': 'Basic cm9vdDpBZGUxMDEw'
                },
                xhrFields: {
                    // The 'xhrFields' property sets additional fields on the XMLHttpRequest.
                    // This can be used to set the 'withCredentials' property.
                    // Set the value to 'true' if you'd like to pass cookies to the server.
                    // If this is enabled, your server must respond with the header
                    // 'Access-Control-Allow-Credentials: true'.
                    withCredentials: false
                },
            }).then(function (data) {
                $scope.status = data.data;
                console.log($scope.status)
                //   $scope.fan1 = $scope.stats.STATS[1].fan1;
                //   $scope.fan2 = $scope.stats.STATS[1].fan2;
                //   $scope.temp1 = Math.max($scope.stats.STATS[1].temp3_1, $scope.stats.STATS[1].temp3_2, $scope.stats.STATS[1].temp3_3)
                //   $scope.temp2 = Math.max($scope.stats.STATS[1].temp2_1, $scope.stats.STATS[1].temp2_2, $scope.stats.STATS[1].temp2_3);

                // $scope.th5 = Number($scope.stats.STATS[1]["GHS 5s"] / 1000).toFixed(2);
                // $scope.thav = Number($scope.stats.STATS[1]["GHS av"] / 1000).toFixed(2);
            });
        }
    }])