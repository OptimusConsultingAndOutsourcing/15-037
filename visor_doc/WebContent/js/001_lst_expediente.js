SOAPGateway.controller("Visor", function($scope, Gateway) {
	$scope.fileList = [];
	Gateway.get({
		UddiServiceRegistryName: "http://slopr03123.mercantilseguros.com:17011/underlying/oracledb/rector/serviciorecaudos/ServicioRecaudos",
		OperationElementName: "consultarDocumentosSol"
	}, function(operation) {
		operation.Envelope.Body.consultarDocumentosSol.piFuncionalidad.__text = "VISOR_DOC";
		operation.Envelope.Body.consultarDocumentosSol.piAplicacion.__text = "GEST_DOCU";
		operation.Envelope.Body.consultarDocumentosSol.cabeceraSol.funcionalidad.__text = "VISOR_DOC";
// 		operation.Envelope.Body.consultarDocumentosSol.piNameFile.__text = "GEST_DOCU";
		operation.$post(function(response) {
			if ((response.poSalida == "0") && (response.poListaConsulta.docoListaConsulta)) {
				var id = 0;
				$scope.fileList = [].concat(response.poListaConsulta.docoListaConsulta).map(function(file) {
					file.doecNmArchivoFs = encodeURIComponent(file.doecNmArchivoFs);
					file.id = id;
					id++;
					return file;
				});
				$scope.fileList[0].active = ($scope.fileList.length > 0);
				$scope.builtree();
			}
		});
	});
	$scope.builtree = function() {
		$scope.documents = [];
		$.each($scope.fileList, function(index, doc) {
			if ($.inArray(doc.docdDotdCdDocumento, $scope.documents) === -1) {
				$scope.documents.push(doc.docdDotdCdDocumento);
			}
		});
		$scope.documents = $scope.documents.map(function(docdDotdCdDocumento) {
			return {
				files: $scope.fileList.filter(function(doc) {
					return doc.docdDotdCdDocumento == docdDotdCdDocumento;
				})
			};
		});
		$scope.sections = [];
		$.each($scope.fileList, function(index, doc) {
			if ($.inArray(doc.docdCdSeccion, $scope.sections) === -1) {
				$scope.sections.push(doc.docdCdSeccion);
			}
		});
		$scope.sections = $scope.sections.map(function(docdCdSeccion) {
			return {
				documents: $scope.documents.filter(function(doc) {
					return doc.files[0].docdCdSeccion == docdCdSeccion;
				})
			};
		});
	}
	$scope.isImage = function(file) {
		return ["jpg", "jepg", "png", "gif", "bmp", "png"].filter(function(ext) {
			return file.doecNmArchivoFs.substring(file.doecNmArchivoFs.lastIndexOf(".") + 1).toLowerCase() == ext;
		}).length > 0;
	}
	$scope.active = function(index) {
		if (index > -1)
		{
			$scope.fileList = $scope.fileList.map(function(file) {
				file.active = false;
				return file;
			});
			if ($scope.fileList.length > 0) $scope.fileList[index].active = true;
		}
	}
	$scope.before = function() {
		var selected = $scope.fileList.filter(function(file) {
			return file.active;
		});
		if (selected.length > 0) $scope.active(selected[0].id == 0 ? $scope.fileList.length - 1 : selected[0].id - 1);
	}
	$scope.after = function() {
		var selected = $scope.fileList.filter(function(file) {
			return file.active;
		});
		if (selected.length > 0) $scope.active(selected[0].id == $scope.fileList.length - 1 ? 0 : selected[0].id + 1);
	}
});
