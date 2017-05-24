//var API_HOST = "../soapgateway/";
var API_HOST = "http://slopr81.seguros.mercantilsf.com:8011/soapgateway/";
//var API_HOST = "../soapgateway/";
var usuario;
var SOAPGateway = angular.module("SOAPGateway", ['ngRoute', 'ngResource', 'xml', 'angular-loading-bar']).config(function (x2jsProvider, $httpProvider)
{
	$httpProvider.interceptors.push('xmlHttpInterceptor');
	x2jsProvider.config = {//escapeMode               : true|false - Escaping XML characters. Default is true from v1.1.0+
		//attributePrefix          : "<string>" - Prefix for XML attributes in JSon model. Default is "_"
		//arrayAccessForm          : "none"|"property" - The array access form (none|property). Use this property if you want X2JS generates an additional property <element>_asArray to access in array form for any XML element. Default is none from v1.1.0+
		//emptyNodeForm            : "text"|"object" - Handling empty nodes (text|object) mode. When X2JS found empty node like <test></test> it will be transformed to test : '' for 'text' mode, or to Object for 'object' mode. Default is 'text'
		//enableToStringFunc       : true|false - Enable/disable an auxiliary function in generated JSON objects to print text nodes with text/cdata. Default is true
		//arrayAccessFormPaths     : [] - Array access paths. Use this option to configure paths to XML elements always in "array form". You can configure beforehand paths to all your array elements based on XSD or your knowledge. Every path could be a simple string (like 'parent.child1.child2'), a regex (like /.*\.child2/), or a custom function. Default is empty
		//skipEmptyTextNodesForObj : true|false - Skip empty text tags for nodes with children. Default is true.
		//stripWhitespaces         : true|false - Strip whitespaces (trimming text nodes). Default is true.
		//datetimeAccessFormPaths  : [] - Datetime access paths. Use this option to configure paths to XML elements for "datetime form". You can configure beforehand paths to all your array elements based on XSD or your knowledge. Every path could be a simple string (like 'parent.child1.child2'), a regex (like /.*\.child2/), or a custom function. Default is empty
	}
}).run(function ($rootScope, $http)
{
	$.cookie.json = true;
	usuario = getServerVariable("usuario");
	$rootScope.pms = getParameter('pms');
	$rootScope.aux = getParameter('aux');
	$http.defaults.headers.common['Authorization'] = getServerVariable('AuthToken');
}).directive('loading', ['$http', function ($http)
{
	return {
		restrict: 'A',
		link: function (scope, elm, attrs)
		{
			scope.isLoading = function ()
			{
				return $http.pendingRequests.length > 0;
			};
			scope.$watch(scope.isLoading, function (v)
			{
				if (v)
				{
					elm.show();
				} else
				{
					elm.hide();
				}
			});
		}
	};
}
]).factory('SOAPRequestMessage', function (x2js)
{
	return {
		fromTemplate: function (XMLDocument)
		{
			var SOAPRequestMessage = x2js.xml_str2json(XMLDocument);
			SOAPRequestMessage.toXMLString = function ()
			{
				return x2js.json2xml_str(this);
			};
			fillParameters(SOAPRequestMessage);
			return SOAPRequestMessage;
		}
	};
}).factory('Gateway', function ($resource)
{
	return $resource(API_HOST + "rest/soap/post", {}, {
		post: {
			method: "POST"
		}
	});
});

function getServerVariable(name)
{
	var variable = $.cookie(name);
	if (!variable)
	{
		var req = new XMLHttpRequest();
		req.open('GET', document.location, false);
		req.send();
		variable = req.getResponseHeader(name);
		try
		{
			variable = JSON.parse(variable);
		}
		catch(e){ }
	}
	return variable;
}

function getParameter(name, url)
{
	switch (name)
	{
		case "fecha":
			var date = new Date();
			date.setTime(date.getTime() - (date.getTimezoneOffset() * 60 * 1000));
			return date.toISOString().split("T")[0];
		case "hora":
			var date = new Date();
			date.setTime(date.getTime() - (date.getTimezoneOffset() * 60 * 1000));
			return date.toISOString().split("T")[1].split(".")[0];
		case "usuario":
		case "piUsuario":
			return usuario ? usuario.codUsuario : null;
		case "piCdAsesor":
			return usuario ? usuario.datosUsuario.codigo : null;
		default:
			if (!url)
			{
				url = window.location.href;
			}
			name = name.replace(/[\[\]]/g, "\\$&");
			var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)")
				, results = regex.exec(url);
			if (!results)
				return null;
			if (!results[2])
				return '';
			return decodeURIComponent(results[2].replace(/\+/g, " "));
	}
}

function fillParameters(target)
{
	if (target instanceof Object)
	{
		for (var k in target)
		{
			if (k.substring(0, 1) != "_")
			{
				if (typeof target[k] == "string")
				{
					target[k] = getParameter(k) || target[k];
				}
				else
				{
					target[k].__text = getParameter(k) || target[k].__text;
					fillParameters(target[k]);
				}
			}
		}
	}
}



