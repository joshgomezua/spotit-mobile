"use strict";

(function() {

	var config = {
		baseUrl: 'https://spotit-115814.appspot.com'
	}
	var router = new VueRouter();


	/* Helpers */

	function measure(lat1, lon1, lat2, lon2){  // generally used geo measurement function
		var R = 6378.137; // Radius of earth in KM
		var dLat = (lat2 - lat1) * Math.PI / 180;
		var dLon = (lon2 - lon1) * Math.PI / 180;
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
		Math.sin(dLon/2) * Math.sin(dLon/2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		var d = R * c;
		return d * 1000; // meters
	}


	/* Components */

	var loginComponent = Vue.component("login-component", {
		template: "#login-template",
		data: function() {
			return {
				signin: {
					emailId: '',
					password: ''
				},
				btnlabel: 'Login',
				btnenabled: true
			};
		},
		created: function() {
			this.$parent.setState("Login");
			/// for testing
			/*this.signin.emailId = 'stefan.miroslav6@gmail.com';
			this.signin.password = '';*/
		},
		methods: {
			login: function() {
				this.btnlabel = 'Logging in...';
				this.btnenabled = false;
				var _this = this;
				this.$parent.request('/v1/users/authenticate', 'POST', this.signin, function(response) {
					if(response.data.statusCode == "USER_AUTH_OK") {
						_this.$parent.token = response.data.token;
						window.spotItToken = response.data.token;
						router.go({ name: 'index' });
					} else {
						alert(response.data.message);
						_this.btnlabel = "Login";
						_this.btnenabled = true;
					}
				}, function(response) {
					alert("Unable to access server api");
					_this.btnlabel = "Login";
					_this.btnenabled = true;
				});
			}
		}
	});

	var getCoordinateComponent = Vue.component("getcoordinate-component", {
		template: "#getcoordinate-template",
		data: function() {
			return {
				status: "",
				debug: true,
				position: false
			}
		},
		created: function() {
			this.$parent.setState("Request Geolocation");
			this.status = "Getting your geolocation...";

			if(!navigator.geolocation) {
				this.status = "Geolocation is not supported by your browser";
				this.redirectToHome();
				return;
			}

			var _this = this;

			/// for testing
			var _this = this;
			for(var i = 0; i < 2; i++) {
				navigator.geolocation.watchPosition(function(pos) {
					_this.position = {
						lat: pos.coords.latitude,
						lng: pos.coords.longitude
					};
					_this.status = 'Geolocation retrieved.';
				}, function() {
				}, {
					timeout: 1000
				});
				if(this.position != false) {
					break;
				}
			}

			/*function success(position) {
				var latitude  = position.coords.latitude;
				var longitude = position.coords.longitude;

				/// for testing
				//latitude = 39.22361;//39.228464647588128;
				//longitude = -77.249794;//-77.265091989135725;

				window.currentGeoLocation = {
					latitude: latitude,
					longitude: longitude
				};

				router.go({ name: 'index' });
			};

			function error() {
				this.status = "Unable to retrieve your location";
				_this.redirectToHome();
			};

			navigator.geolocation.getCurrentPosition(success, error);*/
		},
		methods: {
			redirectToHome: function() {
				setTimeout(function() {
					window.location.href = "http://spot-it.com/";
				}, 1000);
			},
			nextpage: function() {	/// for testing
				var latitude  = this.position.latitude;
				var longitude = this.position.longitude;

				window.currentGeoLocation = {
					latitude: latitude,
					longitude: longitude
				};

				router.go({ name: 'index' });
			}
		}
	});

	var indexComponent = Vue.component("index-component", {
		template: "#index-template",
		data: function() {
			return {
				status: '',
				spots: [],
				closeSpots: []
			}
		},
		created: function() {
			this.$parent.setState("Spots");
			if(!window.currentGeoLocation) {
				router.go({ name: 'getcoordinate' });
				return;
			}
			this.findSpots();
		},
		methods: {
			updateSpots: function(spots) {
				var	lat = window.currentGeoLocation.latitude,
					lng = window.currentGeoLocation.longitude;
				this.closeSpots = [];
				this.spots = [];
				var _this = this;
				spots.every(function(spot) {
					if(measure(lat, lng, spot.location.latLongPoint.latitude, spot.location.latLongPoint.longitude) <= 100) {
						_this.closeSpots.push(spot);
					} else {
						_this.spots.push(spot);
					}
				});
			},
			findSpots: function() {
				var	lat = window.currentGeoLocation.latitude,
					lng = window.currentGeoLocation.longitude,
					delta = 0.025;

				var data = {
					"southwest": { "latitude": lat - delta, "longitude": lng - delta },
					"northeast": { "latitude": lat + delta, "longitude": lng + delta },
					"filter": {
						"propertyType": { "key": "details.propertyType", "operator": "eq", "value": "*" }
					},
					"type": "all"
				};

				var _this = this;
				_this.status = "Looking for spots...";
				this.$parent.request('/v1/spots/find', 'POST', data, function(response) {
					_this.updateSpots(response.data);
					_this.status = '';
				}, function(response) {
					_this.status = "Unable to connect to the server";
				});
			},
			onClickSpot: function(spot) {
				router.go({ name: 'details', params: { id: spot.spotId } })
			}
		}
	});

	var detailsComponent = Vue.component('details-component', {
		template: "#details-template",
		data: function() {
			return {
				spotId: '',
				spot: false,
				status: ''
			}
		},
		created: function() {
			this.$parent.setState("Spot Details", true);
			this.spotId = this.$route.params.id;
			this.getDetails();
		},
		methods: {
			getDetails: function() {
				var _this = this;
				this.status = 'Getting spot details...';
				this.$parent.request("/v1/spots/get/" + this.spotId, "GET", false, function(response) {
					if(response.data) {
						_this.spot = response.data;
						_this.status = '';
					} else {
						_this.status = 'Failed to get spot details';
						router.go({ name: 'index' });
					}
				}, function(response) {
					_this.status = 'Unable to connect to server';
					router.go({ name: 'index' });
				});
			}
		}
	});


	/* Main instance */

	var App = Vue.extend({
		data: function() {
			return {
				title: '',
				back: false
			}
		},
		methods: {
			onBack: function() {
				router.go({ name: 'index' });
			},
			request: function(url, method, data, success, error) {
				this.$http({
					url: config.baseUrl + url,
					method: method,
					data: data
				})
				.then(function (response) {
					if(success) {
						success(response);
					}
				}, function (response) {
					if(error) {
						error(response);
					} else {
						alert('Failed to connect to server');
					}
				});
			},
			setState: function(title, back) {
				this.title = title;
				if(back) {
					this.back = true;
				}
			}
		}
	});


	/* Set up routes and start app */

	router.map({
	    '/': {
	    	name: 'index',
	        component: indexComponent
	    },
	    '/login': {
	    	name: 'login',
	        component: loginComponent
	    },
	    '/getpos': {
	    	name: 'getcoordinate',
	    	component: getCoordinateComponent
	    },
	    '/details/:id': {
	    	name: 'details',
	    	component: detailsComponent
	    }
	});
	/*router.beforeEach(function (transition) {
		if(transition.to.path != '/login' && !window.spotItToken) {
			transition.redirect({ name: 'login' });
		} else {
			transition.next();
		}
	});*/
	router.start(App, '#app');

})();