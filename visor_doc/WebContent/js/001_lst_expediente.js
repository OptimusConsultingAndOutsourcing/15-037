SOAPGateway.controller("Visor", function ($scope, Gateway)
{
    Gateway.get({ UddiServiceRegistryName: "http://slopr03123.mercantilseguros.com:17011/underlying/oracledb/rector/serviciorecaudos/ServicioRecaudos", OperationElementName: "consultarDocumentosSol" }, function (operation)
    {
        operation.Envelope.Body.consultarDocumentosSol.piFuncionalidad.__text = "VISOR_DOC";
        operation.Envelope.Body.consultarDocumentosSol.piAplicacion.__text = "GEST_DOCU";
        operation.Envelope.Body.consultarDocumentosSol.cabeceraSol.funcionalidad.__text = "VISOR_DOC";
        //operation.Envelope.Body.consultarDocumentosSol.cabeceraSol.aplicacion.__text = "GEST_DOCU";
        operation.$post(function(response)
        {
            if ((response.poSalida == "0") && (response.poListaConsulta.docoListaConsulta))
            {
                var id = 0;
                $scope.fileList = response.poListaConsulta.docoListaConsulta.map(function (file)
                {
                    file.doecNmArchivoFs = encodeURIComponent(file.doecNmArchivoFs);
                    file.id = id;
                    id++;
                    return file;
                });
                $scope.builtree();
            }
        });
    });
    $scope.builtree = function ()
    {
        $scope.documents = [];
        $.each($scope.fileList, function (index, doc)
        {
            if ($.inArray(doc.docdDotdCdDocumento, $scope.documents) === -1)
            {
                $scope.documents.push(doc.docdDotdCdDocumento);
            }
        });
        $scope.documents = $scope.documents.map(function (docdDotdCdDocumento)
        {
            return {
                files: $scope.fileList.filter(function (doc)
                {
                    return doc.docdDotdCdDocumento == docdDotdCdDocumento;
                })
            };
        });
        $scope.sections = [];
        $.each($scope.fileList, function (index, doc)
        {
            if ($.inArray(doc.docdCdSeccion, $scope.sections) === -1)
            {
                $scope.sections.push(doc.docdCdSeccion);
            }
        });
        $scope.sections = $scope.sections.map(function (docdCdSeccion)
        {
            return {
                documents: $scope.documents.filter(function (doc)
                {
                    return doc.files[0].docdCdSeccion == docdCdSeccion;
                })
            };
        });
    }
    $scope.isImage = function(file)
    {
        return ["jpg", "jepg", "png", "gif", "bmp", "png"].filter(function(ext){ return file.doecNmArchivoFs.substring(file.doecNmArchivoFs.lastIndexOf(".") + 1).toLowerCase() == ext; }).length > 0;
    }
});

