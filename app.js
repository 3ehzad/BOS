angular.module('BOSapiclient', ['ngMaterial', 'ngMessages'])
    .config(['$httpProvider', '$qProvider', function ($httpProvider, $qProvider) {
        $qProvider.errorOnUnhandledRejections(false);
        // $httpProvider.defaults.withCredentials = true;
    }])

    .run(['$rootScope', '$http', function ($rootScope, $http) {
        $http.get('config.json?_=' + Date.now(), { cache: false }).then(function (data) {
            $rootScope.config = data.data;
        });
    }])

    .controller('panelController', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
        $scope.psuStatus = function () {
            $http.get($rootScope.config[0].arip + 'PSU_STATUS', { cache: false }).then(function (data) {
                $scope.minerstatus = data.data;
            });
        }
        // run commands
        $scope.psuRUN = function () {
            $http.get($rootScope.config[0].arip + 'MINER_RUN').then(function (response) {
                $scope.psuresponse = response.data;
            });
        }
        $scope.psuSTOP = function () {
            $http.get($rootScope.config[0].arip + 'MINER_STOP').then(function (response) {
                $scope.psuresponse = response.data;
            });
        }
        // bug: command name check MINER_ON or MINERALL_ON
        $scope.psuALLON = function () {
            $http.get($rootScope.config[0].arip + 'MINERALL_ON').then(function (response) {
                $scope.psuresponse = response.data;
            });
        }
        $scope.psuALLOFF = function () {
            $http.get($rootScope.config[0].arip + 'MINER_OFF').then(function (response) {
                $scope.psuresponse = response.data;
            });
        }
        $scope.modemRESET = function () {
            $http.get($rootScope.config[0].arip + 'MODEMRESET').then(function (response) {
                $scope.modemresponse = response.data;
            });
        }
        // $scope.camOFF = function () {
        //     $http.get($rootScope.espip + 'CAMOFF').then(function (response) {
        //         $scope.camresponse = response.data;
        //     });
        // }
        // $scope.camRESET = function () {
        //     $http.get($rootScope.espip + 'CAMRESET').then(function (response) {
        //         $scope.camresponse = response.data;
        //     });
        // }
    }])

    .controller('deviceController', ['$scope', '$rootScope', '$http', '$mdDialog', '$mdToast', '$window', function ($scope, $rootScope, $http, $mdDialog, $mdToast, $window) {
        $scope.isLoading = true;
        $http.get('miners.json?_=' + Date.now(), { cache: false }).then(function (data) {
            $scope.miners = data.data;
            $scope.isLoading = false;
            var str = JSON.stringify($scope.miners)
            $rootScope.rCount = (str.match(/\"R\"/g) || []).length;
            $rootScope.sCount = (str.match(/\"S\"/g) || []).length;
            $rootScope.tCount = (str.match(/\"T\"/g) || []).length;
        });
        //get relay status of per device
        $scope.relayStatus = function () {
            $http.get($rootScope.config[0].arip + 'RELAY_STATUS', { cache: false }).then(function (data) {
                $rootScope.relaystatus = data.data;
            });
        }
        $scope.relayON = function (relay) {
            $http.get($rootScope.config[0].arip + 'RELAYON_' + relay).then(function (response) {
                $scope.relayresponse = response.data;
                //start toast
                $mdToast.show(
                    $mdToast.simple()
                        .textContent("Miner is going to turn ON")
                        .position("top right")
                        .theme('succss-toast')
                        .hideDelay(5000)
                );
                // end toast
            });
        }
        $scope.relayOFF = function (relay) {
            $http.get($rootScope.config[0].arip + 'RELAYOFF_' + relay).then(function (response) {
                $scope.psrelayresponseustatus = response.data;
                //start toast
                $mdToast.show(
                    $mdToast.simple()
                        .textContent("Miner is going to turn OFF")
                        .position("top right")
                        .theme('error-toast')
                        .hideDelay(5000)
                );
                // end toast

            });
        }
        /* start dialog */
        $scope.fetchapi = function (ev, index) {
            $mdDialog.show({
                locals: { dataToPass: $scope.miners[index] },
                controller: devController,
                templateUrl: 'detail.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: false,
                preserveScope: true
            })
        };
        function devController($scope, $mdDialog, dataToPass) {
            $scope.device = dataToPass;
            $scope.hide = function () {
                $mdDialog.hide();
            };

            //fetch api from device
            if ($scope.device.os == "BOS+" || $scope.device.os == "BOS") { 
                $http({
                    method: 'POST',
                    url: $rootScope.config[0].wsip + $scope.device.ip + '/cgi-bin/luci/admin/miner/api_status?luci_username='+ $rootScope.config[0].username +'&luci_password='+ $rootScope.config[0].password,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(function (data) {
                    $scope.stats = data.data;
                    $scope.th5 = Number($scope.stats.STATS[1]["GHS 5s"] / 1000).toFixed(2);
                    $scope.thav = Number($scope.stats.STATS[1]["GHS av"] / 1000).toFixed(2);
                    $scope.temp1 = Math.max($scope.stats.STATS[1].temp6, $scope.stats.STATS[1].temp7, $scope.stats.STATS[1].temp8)
                    $scope.temp2 = Math.max($scope.stats.STATS[1].temp2_6, $scope.stats.STATS[1].temp2_7, $scope.stats.STATS[1].temp2_8);
                });
            } else if ($scope.device.os == "COB") {
                $http({
                    method: 'GET',
                    url: $rootScope.config[0].wsip + $scope.device.ip + ':4028/stats',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(function (data) {
                    $scope.stats = data.data;
                    $scope.th5 = Number($scope.stats.STATS[1]["GHS 5s"] / 1000).toFixed(2);
                    $scope.thav = Number($scope.stats.STATS[1]["GHS av"] / 1000).toFixed(2);
                    $scope.temp1 = Math.max($scope.stats.STATS[1].temp6, $scope.stats.STATS[1].temp7, $scope.stats.STATS[1].temp8)
                    $scope.temp2 = Math.max($scope.stats.STATS[1].temp2_6, $scope.stats.STATS[1].temp2_7, $scope.stats.STATS[1].temp2_8);
                });
            } else {
                $scope.develop = "Not Support"
            }

            //open device management page
            $scope.manage = function (ip) {
                $window.open($rootScope.config[0].wsip + ip, '_blank');
            };
        }

    }])
