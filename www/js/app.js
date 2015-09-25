// Ionic Starter App
var localDB = new PouchDB("todos");
var remoteDB = new PouchDB("http://172.16.10.130:5984/todos");

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  localDB.sync(remoteDB, {
    live: true
  });
});

app.factory('PouchDBListener', ['$rootScope', function($rootScope) {
  localDB.changes({
    continuous: true,
    onChange: function(change) {
      if (!change.deleted) {
        $rootScope.$apply(function() {
          localDB.get(change.id, function(err, doc) {
            $rootScope.$apply(function() {
              if (err) console.log(err);
              $rootScope.$broadcast('add', doc);
            })
          });
        })
      } else {
        $rootScope.$apply(function() {
          $rootScope.$broadcast('delete', change.id);
        });
      }
    }
  });
  return true;
}]);

app.controller("TodoController", function($scope, $ionicPopup, PouchDBListener) {
  $scope.todos = [];
  $scope.showDelete = false;
  $scope.create = function() {
    $ionicPopup.prompt({
        title: '输入一个任务',
        inputType: 'text'
      })
      .then(function(result) {
        if (result) {
          if ($scope.hasOwnProperty("todos") !== true) {
            $scope.todos = [];
          }
          localDB.post({
            title: result,
            done: false
          });
        } else {
          console.log("Action cancelled.");
        }
      });
  }

  $scope.update = function(todo) {
    localDB.put({
        _id: todo._id,
        _rev: todo._rev,
        title: todo.title,
        done: todo.done
      })
      .then(function(result) {
        // You set some action after the item was updated.
      });
  }
  $scope.$on('add', function(event, todo) {
    var add = true;
    angular.forEach($scope.todos, function(value, key) {
      if (value._id == todo._id) {
        $scope.todos[key] = todo;
        add = false;
        return;
      }
    });
    if (add) {
      $scope.todos.push(todo);
    }
  });

  $scope.$on('delete', function(event, id) {
    for (var i = 0; i < $scope.todos.length; i++) {
      if ($scope.todos[i]._id === id) {
        $scope.todos.splice(i, 1);
      }
    }
  });
});