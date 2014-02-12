window.portfolio = angular.module('portfolio', ['ngRoute', 'ngTouch']) #maybe include ngRetina

.run (monitorScroll) ->
	log 'application started.'

.config ($routeProvider, $locationProvider) ->
	$routeProvider
	.when('/post/:postId', templateUrl: 'partials/post.html', controller: 'Post')
	.otherwise templateUrl: '/partials/home.html'
	$locationProvider.html5Mode true
	$locationProvider.hashPrefix '!'

.controller 'Header', ($scope, $location, scrollToAnchor) ->
	console.log 'header controller loaded'

	$scope.scrollTo = (id) ->
			#fixme hack - angular bug - https://github.com/angular/angular.js/issues/1102
		if $location.path() is '/'
			return scrollToAnchor.go id

		scrollToAnchor.push id
		$location.path '#!/'

.controller 'Tags', ($scope, tagBank) ->
	log 'tags controller loaded.'

.controller 'Projects', ($scope, $http, scrollToAnchor) ->


	@stuff = 'this is accessible stuff'

	# $scope.l = 10
	# $scope.w = 15

	# Object.defineProperty $scope, 'area',
	#   get: ->
	#     $scope.l * $scope.w

	$http.get('json/projects.json')
	.success (projects) ->
		$scope.projects = projects

	$scope.$watch 'projects', (val) ->
		scrollToAnchor.go() if val

	$scope.selectProject = (project) ->
		$scope.selectedProject = project

	$scope.closeImageModal = ->
		$scope.selectedProject = null

	$scope.selectVideo = (video) ->
		$scope.selectedVideo = video

	$scope.closeVideoModal = ->
		$scope.selectedVideo = null

.controller 'Blog', ($scope, $http) ->

	$http.get('json/blog.json')
	.success (posts) ->
		$scope.posts = posts


.controller 'Post', ($scope, $routeParams, $http) ->

	$scope.postId = $routeParams.postId

	$http.get('json/blog.json')
	.success (posts) ->
		$scope.post = posts[$routeParams.postId]
	

.factory 'monitorScroll', ->
	$w = $(window)
	scroll: (cb) ->
		$w.scroll ->
			if _.isFunction cb
				cb $w.scrollTop()

.directive 'onScroll', (monitorScroll) ->
	restrict: 'A'
	scope: {}
	link: (scope, elem, attrs, ngModel) ->
		monitorScroll.scroll (vScroll) ->
			factor = attrs.factor or 1
			elem.css attrs.onScroll, vScroll * factor

.directive 'imageSlider', ->
	templateUrl: 'partials/slider-images.html'
	scope: 
		images: '=imageSlider'
		clickImage: '&'
		currentImage: '='
		imageDir: '@'
	controller: ($scope) ->

		$scope.currentImage = $scope.images[0]

		getCurrentImageIndex = ->
			return $scope.images.indexOf $scope.currentImage

		$scope.nextImage = ($event) ->
			$scope.currentImage = $scope.images[getCurrentImageIndex() + 1] if !$scope.nextDisabled

		$scope.prevImage  = ($event) ->
			$scope.currentImage = $scope.images[getCurrentImageIndex() - 1] if !$scope.prevDisabled

		$scope.$watch 'currentImage', (img) ->
			$scope.nextDisabled = $scope.prevDisabled = false # reset every time
			$scope.nextDisabled = true if getCurrentImageIndex() == $scope.images.length - 1
			$scope.prevDisabled = true if getCurrentImageIndex() == 0

.directive 'imageModal', ->
	restrict: 'A'
	templateUrl: 'partials/image-modal.html'
	scope:
		images: '=imageModal'
		currentImage: '='
		imageDir: '@'
	controller: ($scope) ->
		$scope.clickImage = (currentImage) ->
			nextIndex = 1 + $scope.images.indexOf currentImage
			nextIndex = 0 if nextIndex is $scope.images.length
			$scope.currentImage = $scope.images[nextIndex]

.directive 'videoModal', ->
	restrict: 'A'
	templateUrl: 'partials/video-modal.html'
	scope:
		video: '=videoModal'
		videoDir: '@'
	controller: ($scope, $sce) ->

		$scope.$watchCollection '[videoDir, video]', (newValues) ->
			$scope.trustedVideoUrl = $sce.trustAsResourceUrl newValues[0] + newValues[1]


.directive 'tags', (tagBank) ->
	restrict: 'A'
	scope:
		tags: '='
		showTags: '@'
	templateUrl: 'partials/directives/tags.html'
	controller: ($scope) ->
		#convert to keyed object

		$scope.$watch 'tags', (tags) ->
			if tags
				$scope.tagList = _.map tags, (tag) ->
					foundTag = tagBank.find tag
					foundTag = tagBank.add tag if not foundTag
					foundTag

		$scope.tagList = tagBank.savedTags if $scope.showTags

		$scope.activateTag = (tag) ->
			return tag.selected = true if not tag.selected
			tag.selected = false

.directive 'code', ->
	restrict: 'E'
	compile: (e) ->
		hljs.highlightBlock e[0]


.directive 'disqus', ($window) ->
	restrict: 'A'
	templateUrl: 'partials/directives/disqus.html'
	link: (scope, elem, attrs) ->

		$window.disqus_shortname = 'taylorcode' # required: replace example with your forum shortname

		loadDisqus = ->
			(->
			  @dsq = document.createElement 'script'
			  @dsq.type = 'text/javascript'
			  @dsq.async = true
			  @dsq.src = '//' + @disqus_shortname + '.disqus.com/embed.js'
			  (document.getElementsByTagName('head')[0] or document.getElementsByTagName('body')[0]).appendChild @dsq
			)($window)

		if attrs.disqusTitle?
			return scope.$watch attrs.disqusTitle, (title) ->
				if title
					$window.disqus_title = title #attach to window for disqus's use
					loadDisqus()
		loadDisqus()


.factory 'tagBank', ->
	savedTags = []
	find: (tag) ->
		foundTag = undefined
		_.each this.savedTags, (t) ->
			foundTag = t if t.tag is tag
		foundTag
	add: (tag) ->
		newTag = tag: tag
		this.savedTags.push newTag
		newTag
	savedTags: []

.factory 'scrollToAnchor', ($location, $anchorScroll, $timeout) ->
	go: (id) ->
		#fixme hack - angular bug - https://github.com/angular/angular.js/issues/1102
		id = @pop() if not id
		return if not id
		old = $location.hash()
		$timeout ->
			$location.hash id
			$anchorScroll()
			$location.hash old #restore previous hash state to prevent route change logic from occurring
		, 0
	
	push: (id) ->
		@saved = id
	pop: ->
		val = @saved
		delete @saved
		return val


