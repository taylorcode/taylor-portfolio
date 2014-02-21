// Generated by CoffeeScript 1.6.3
(function() {
  window.portfolio = angular.module('portfolio', ['ngRoute', 'ngTouch']).run(function(monitorScroll) {
    return log('application started.');
  }).config(function($routeProvider, $locationProvider) {
    $routeProvider.when('/post/:postId', {
      templateUrl: 'partials/post.html',
      controller: 'Post'
    }).otherwise({
      templateUrl: '/partials/home.html'
    });
    return $locationProvider.html5Mode(true);
  }).controller('Header', function($scope, $location, scrollToAnchor) {
    console.log('header controller loaded');
    return $scope.scrollTo = function(id) {
      if ($location.path() === '/') {
        return scrollToAnchor.go(id);
      }
      scrollToAnchor.push(id);
      return $location.path('/');
    };
  }).controller('Tags', function($scope, tagBank) {
    return log('tags controller loaded.');
  }).controller('Projects', function($scope, $http, scrollToAnchor) {
    this.stuff = 'this is accessible stuff';
    $http.get('json/projects.json').success(function(projects) {
      return $scope.projects = projects;
    });
    $scope.$watch('projects', function(val) {
      if (val) {
        return scrollToAnchor.go();
      }
    });
    $scope.selectProject = function(project) {
      return $scope.selectedProject = project;
    };
    $scope.closeImageModal = function() {
      return $scope.selectedProject = null;
    };
    $scope.selectVideo = function(video) {
      return $scope.selectedVideo = video;
    };
    return $scope.closeVideoModal = function() {
      return $scope.selectedVideo = null;
    };
  }).controller('Blog', function($scope, $http) {
    return $http.get('json/blog.json').success(function(posts) {
      return $scope.posts = posts;
    });
  }).controller('Post', function($scope, $routeParams, $http) {
    $scope.postId = $routeParams.postId;
    return $http.get('json/blog.json').success(function(posts) {
      return angular.forEach(posts, function(post) {
        if (parseInt($routeParams.postId) === post.id) {
          return $scope.post = post;
        }
      });
    });
  }).factory('monitorScroll', function() {
    var $w;
    $w = $(window);
    return {
      scroll: function(cb) {
        return $w.scroll(function() {
          if (_.isFunction(cb)) {
            return cb($w.scrollTop());
          }
        });
      }
    };
  }).directive('onScroll', function(monitorScroll) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, elem, attrs, ngModel) {
        return monitorScroll.scroll(function(vScroll) {
          var factor;
          factor = attrs.factor || 1;
          return elem.css(attrs.onScroll, vScroll * factor);
        });
      }
    };
  }).directive('imageSlider', function() {
    return {
      templateUrl: 'partials/slider-images.html',
      scope: {
        images: '=imageSlider',
        clickImage: '&',
        currentImage: '=',
        imageDir: '@'
      },
      controller: function($scope) {
        var getCurrentImageIndex;
        $scope.currentImage = $scope.images[0];
        getCurrentImageIndex = function() {
          return $scope.images.indexOf($scope.currentImage);
        };
        $scope.nextImage = function($event) {
          if (!$scope.nextDisabled) {
            return $scope.currentImage = $scope.images[getCurrentImageIndex() + 1];
          }
        };
        $scope.prevImage = function($event) {
          if (!$scope.prevDisabled) {
            return $scope.currentImage = $scope.images[getCurrentImageIndex() - 1];
          }
        };
        return $scope.$watch('currentImage', function(img) {
          $scope.nextDisabled = $scope.prevDisabled = false;
          if (getCurrentImageIndex() === $scope.images.length - 1) {
            $scope.nextDisabled = true;
          }
          if (getCurrentImageIndex() === 0) {
            return $scope.prevDisabled = true;
          }
        });
      }
    };
  }).directive('imageModal', function() {
    return {
      restrict: 'A',
      templateUrl: 'partials/image-modal.html',
      scope: {
        images: '=imageModal',
        currentImage: '=',
        imageDir: '@'
      },
      controller: function($scope) {
        return $scope.clickImage = function(currentImage) {
          var nextIndex;
          nextIndex = 1 + $scope.images.indexOf(currentImage);
          if (nextIndex === $scope.images.length) {
            nextIndex = 0;
          }
          return $scope.currentImage = $scope.images[nextIndex];
        };
      }
    };
  }).directive('videoModal', function() {
    return {
      restrict: 'A',
      templateUrl: 'partials/video-modal.html',
      scope: {
        video: '=videoModal',
        videoDir: '@'
      },
      controller: function($scope, $sce) {
        return $scope.$watchCollection('[videoDir, video]', function(newValues) {
          return $scope.trustedVideoUrl = $sce.trustAsResourceUrl(newValues[0] + newValues[1]);
        });
      }
    };
  }).directive('tags', function(tagBank) {
    return {
      restrict: 'A',
      scope: {
        tags: '=',
        showTags: '@'
      },
      templateUrl: 'partials/directives/tags.html',
      controller: function($scope) {
        $scope.$watch('tags', function(tags) {
          if (tags) {
            return $scope.tagList = _.map(tags, function(tag) {
              var foundTag;
              foundTag = tagBank.find(tag);
              if (!foundTag) {
                foundTag = tagBank.add(tag);
              }
              return foundTag;
            });
          }
        });
        if ($scope.showTags) {
          $scope.tagList = tagBank.savedTags;
        }
        return $scope.activateTag = function(tag) {
          if (!tag.selected) {
            return tag.selected = true;
          }
          return tag.selected = false;
        };
      }
    };
  }).directive('code', function() {
    return {
      restrict: 'E',
      compile: function(e) {
        return hljs.highlightBlock(e[0]);
      }
    };
  }).directive('disqus', function($window) {
    return {
      restrict: 'A',
      templateUrl: 'partials/directives/disqus.html',
      link: function(scope, elem, attrs) {
        var loadDisqus;
        $window.disqus_shortname = 'taylorcode';
        loadDisqus = function() {
          return (function() {
            this.dsq = document.createElement('script');
            this.dsq.type = 'text/javascript';
            this.dsq.async = true;
            this.dsq.src = '//' + this.disqus_shortname + '.disqus.com/embed.js';
            return (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(this.dsq);
          })($window);
        };
        if (attrs.disqusTitle != null) {
          return scope.$watch(attrs.disqusTitle, function(title) {
            if (title) {
              $window.disqus_title = title;
              return loadDisqus();
            }
          });
        }
        return loadDisqus();
      }
    };
  }).factory('tagBank', function() {
    var savedTags;
    savedTags = [];
    return {
      find: function(tag) {
        var foundTag;
        foundTag = void 0;
        _.each(this.savedTags, function(t) {
          if (t.tag === tag) {
            return foundTag = t;
          }
        });
        return foundTag;
      },
      add: function(tag) {
        var newTag;
        newTag = {
          tag: tag
        };
        this.savedTags.push(newTag);
        return newTag;
      },
      savedTags: []
    };
  }).factory('scrollToAnchor', function($location, $anchorScroll, $timeout) {
    return {
      go: function(id) {
        var old;
        if (!id) {
          id = this.pop();
        }
        if (!id) {
          return;
        }
        old = $location.hash();
        return $timeout(function() {
          $location.hash(id);
          $anchorScroll();
          return $location.hash(old);
        }, 0);
      },
      push: function(id) {
        return this.saved = id;
      },
      pop: function() {
        var val;
        val = this.saved;
        delete this.saved;
        return val;
      }
    };
  }).filter('reverse', function() {
    return function(items) {
      if (items) {
        return items.slice().reverse();
      }
    };
  });

}).call(this);
