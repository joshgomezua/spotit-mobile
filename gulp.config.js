module.exports = function() {
	return {
		cssAssets: './assets/css/*.css',
		cssDist: './public/css',
		jsDist: './public/js',
		jsFiles: [
			'./bower_components/vue/dist/vue.min.js',
			'./bower_components/vue-router/dist/vue-router.min.js',
			'./bower_components/vue-resource/dist/vue-resource.min.js',
			'./assets/js/index.js'
		]
	};
}