var app = angular.module("performances-controller", ['ngRoute', 'ngResource', 'ngSanitize', 'ngCsv', 'appRoutes', 'mainCtrl', 'ui']);

app.controller('performancesController', ['$scope', '$http', '$resource', '$timeout', function ($scope, $http, $resource, $timeout) {

//Get all data when loading body
$scope.run = function () {
  //Get the data from criterions in mongoDB
  $http.get('/api/criterions').success(function(data) {
    $scope.criterions = data;
    })
    .error(function(data) {
      console.log('Error: ' + data);
  }); 

  //Get the data from alternatives in mongoDB
  $http.get('/api/alternatives').success(function(data) {
    $scope.alternatives = data;
    })
    .error(function(data) {
      console.log('Error: ' + data);
  });   

  //Get the data from performances in mongoDB
  $http.get('/api/performances').success(function(data) {
    $scope.performances = data;
    })
    .error(function(data) {
      console.log('Error: ' + data);
  });
}

//Get the data from criterions in mongoDB
$http.get('/api/criterions').success(function(data) {
  $scope.criterions = data;
  })
  .error(function(data) {
    console.log('Error: ' + data);
}); 

//Get the data from alternatives in mongoDB
$http.get('/api/alternatives').success(function(data) {
  $scope.alternatives = data;
  })
  .error(function(data) {
    console.log('Error: ' + data);
});   

var Performances = $resource('/api/performances');

//Get the data from performances in mongoDB
$http.get('/api/performances').success(function(data) {
  $scope.performances = data;
  })
  .error(function(data) {
    console.log('Error: ' + data);
});

var refresh = function(){
  $http.get('/api/performances').success(function(response) {
    console.log('I got the data I requested');
        $scope.performances = response;
    });  
}  

//Create performance
$scope.createPerformance = function () {
  var performance = new Performances();
  performance.alternative = $scope.performance.alternative;
  performance.criterion = $scope.performance.criterion;
  performance.value = $scope.performance.value;
  performance.$save(function (result) {
    $scope.performances.push(result);
    $scope.performance.alternative = '';
    $scope.performance.criterion = '';
    $scope.performance.value = '';
  })
}

//Delete performance
$scope.deletePerformance = function(performance) {
  var i = performance._id;
  $http.delete('/api/performance/' + i)
    .success(function() {
      console.log("success");
      var idx = $scope.performances.indexOf(performance);
      if (idx >= 0) {
        $scope.performances.splice(idx, 1);
      }
    })
    .error(function() {
      //console.log('Error: ' + i);
      var idx = $scope.performances.indexOf(performance);
      if (idx >= 0) {
        $scope.performances.splice(idx, 1);
      }
    });
}

//Edit performance
$scope.editPerformance = function(performance) {
  var i = performance._id;
  console.log(i);
  $http.get('/api/performance/' + i).success(function(response) {
        $scope.performance = response;
    });
}

//Then save it or update it
$scope.updatePerformance = function() {
  console.log($scope.performance._id);
  $http.put('/api/performance/' + $scope.performance._id, $scope.performance).success(function(response) {
    refresh();
    $scope.performance.alternative = '';
    $scope.performance.criterion = '';
    $scope.performance.value = '';
  });
}

// Count the performances created
$scope.j = 0;
//Create all performances
$scope.createPerformance2 = function (alternative, criterion, numAlt, numCri) {
  // var x = $scope.alternatives;
  // console.log(x);
  // var xx = $scope.criterions;
  // console.log(xx);
  // var xxx = $scope.performances;
  // console.log(xxx);
  // var xxxx = $scope.performances.length;
  // console.log(xxxx);
  var i = 0;
  //See if performances data is empty
  if(i == $scope.performances.length || $scope.performances.length == 'undefined' || $scope.performances.length == null || $scope.performances.length == []){
    var numExistingPerformances = i;
  }else{
    var numExistingPerformances = $scope.performances.length;
  }
  var rightNumPerformances = numAlt*numCri;
  console.log(rightNumPerformances); //Number of performances that should be on the database 
  console.log(numExistingPerformances); //Number of performances that actual exist
  //var t = rightNumPerformances - 1; 
  
  //Create performances if performances on mongodb is empty or with the incorrect number of elements
  if(rightNumPerformances == numExistingPerformances){
      console.log("Don't create performance");
      //Nothing changed on the number of criteria and alternatives
  }else{
    if(numExistingPerformances == 0){
      //If it's empty create all perfomances
      //Create a performance
      console.log("Create performance");
      $scope.j = $scope.j + 1;
      console.log($scope.j);
      var performance = new Performances();
      performance.alternative = alternative.name;
      performance.criterion = criterion.name;
      performance.value = 0;
      performance.$save(function (result) {
        $scope.performances.push(result);
      })
      // See if it's the last performance to create if it is update the performance table
      if($scope.j == rightNumPerformances){
        console.log('Last performance being created...');
          refresh();
          //Update performance table after some time
          $timeout( function(){ 
            //Show all values on performance table
            var i, l = $scope.performances.length;
            var x = $scope.criterions.length;
            // Slice the performances results so it can be put inside a table numAlternativeXnumCriteria
            $scope.chunks = [];
            for ( i = 0; i < l; i += x) {
                $scope.chunks.push( $scope.performances.slice(i, i + x));
            }
            console.log('Done slicing performances');
          }, 1000);
      }
    }else{
      //Delete all performances if it's length is not equal to zero or rightNumPerformances before creating all of them
      //deletePerformance2(); 
    }
  }
}

//Delete performance
$scope.deletePerformance2 = function() {
  //Delete all performances 
  //Note it works but for some reason it prints the error message
  $http.delete('/api/performances')
    .success(function() {
      console.log("success");
    })
    .error(function() {
      //console.log('Error: fail deletes' );
    });
    refresh();
}

// At the beginning see if alternatives or criteria where change to update the performance table 
$scope.confirmPerformance  = function() {
  var numCriteria = $scope.criterions.length;
  var numAlternatives = $scope.alternatives.length;
  var rightNumPerformances = numCriteria * numAlternatives;
  var numExistingPerformances = $scope.performances.length;
  console.log('Number of performances that should exist: ' + rightNumPerformances);
  console.log('Actual number of performances now: ' + numExistingPerformances);
  // Confirm size of table more than once, just to be sure that it was updated
  //for(var i = 0; i < 2; i++){
    if(numExistingPerformances == rightNumPerformances){
      console.log('Performance Table is current.');
        //Get all performances to put them inside a table
        var i, l = $scope.performances.length;
        var x = $scope.criterions.length;
        // Slice the performances results so it can be put inside a table numAlternativeXnumCriteria
        $scope.chunks = [];
        for ( i = 0; i < l; i += x) {
            $scope.chunks.push( $scope.performances.slice(i, i + x));
        }
        console.log('Done slicing performances');
    }else{
      //If number of criteria or alternatives was changed, update performance table
      $scope.deletePerformance2();
      console.log('Performance Table has been updated.');
    }
  //}
}

// Time to execute the performance table review 
$timeout( function(){ 
  refresh();
  //Update performance table if necessary
  $scope.confirmPerformance(); 
  refresh();
}, 500);



//Update the value 
$scope.updatePerformance2 = function(performance) {
  var i = performance._id;
  //console.log(i);
  $http.get('/api/performance/' + i).success(function(response) {
        $scope.performance = response;
    });

  $http.put('/api/performance/' + i, performance).success(function(response) {
    refresh();
  });
}

// $scope.teste = [];
// $scope.setTable = function(performances) {
//   $scope.teste = performances;
// }

// When importing data, update performances on mongodb
$scope.uploadfile = function(scope, element) {
  $timeout( function(){ 
                      var performanceTable = document.getElementById("performanceTable");
                      var rows = performanceTable.rows;
                      //console.log(rows.length);
                      for (var i = 0; i < rows.length; i++) {
                          var cells = rows[0].cells;
                          //console.log(cells.length);
                          for (var j = 0; j < cells.length; j++) {
                                    if(i == 0 | j == 0){
                                        //Ignore
                                    }else{
                                        //performanceTable.rows[i].cells[j].children[0].value = cells[j]; 
                                        var item = performanceTable.rows[i].cells[j].children[0];
                                        //console.log(item);
                                        angular.element(item).trigger('change');
                                    }
                          }
                      }
                    }, 500);
      }

}]);

//Export performance atbel into a .csv file 
app.directive('exportPerformanceToCsv',function(){
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var el = element[0];
          element.bind('click', function(e){
            //var table = e.target.nextElementSibling;
            var table = document.getElementById("performanceTable");
            var csvString = '';
            for(var i=0; i<table.rows.length;i++){
                var rowData = table.rows[i].cells;
                for(var j=0; j<rowData.length;j++){ //number of columns to export
                  // See if it's a header value or a first column value
                  if(i == 0 || j == 0){ 
                    csvString = csvString + rowData[j].innerHTML + ",";
                  }else{
                    csvString = csvString + rowData[j].children[0].value + ",";
                  }
                }
                csvString = csvString.substring(0,csvString.length - 1); //delete the last values which is a coma (,)
                csvString = csvString + "\n";
          }
            csvString = csvString.substring(0, csvString.length - 1);
            var a = $('<a/>', {
                style:'display:none',
                href:'data:application/octet-stream;base64,'+btoa(csvString),
                download:'performance_table.csv'
            }).appendTo('body')
            a[0].click()
            a.remove();
          });
      }
    }
});


