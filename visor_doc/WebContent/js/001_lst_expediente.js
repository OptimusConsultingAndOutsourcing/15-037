SOAPGateway.controller("Visor", function ($scope, Gateway)
{
    Gateway.get({ UddiServiceRegistryName: "ServicioRecaudos", OperationElementName: "consultarDocumentosSol" }, function (operation)
    {
        operation.Envelope.Body.consultarDocumentosSol.piFuncionalidad.__text = "VISOR_DOC";
        operation.Envelope.Body.consultarDocumentosSol.piAplicacion.__text = "GEST_DOCU";
        operation.Envelope.Body.consultarDocumentosSol.cabeceraSol.funcionalidad.__text = "VISOR_DOC";
        //operation.Envelope.Body.consultarDocumentosSol.cabeceraSol.aplicacion.__text = "GEST_DOCU";
        operation.$post(function(response)
        {
            if ((response.poSalida)
            && (response.poSalida.__text == "0")
            && (response.poListaConsulta.docoListaConsulta))
            {
                var id = 0;
                $scope.fileList = response.poListaConsulta.docoListaConsulta.map(function (file)
                {
                    file.doecNmArchivoFs.__text = encodeURIComponent(file.doecNmArchivoFs.__text);
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
            if ($.inArray(doc.docdDotdCdDocumento.__text, $scope.documents) === -1)
            {
                $scope.documents.push(doc.docdDotdCdDocumento.__text);
            }
        });
        $scope.documents = $scope.documents.map(function (docdDotdCdDocumento)
        {
            return {
                files: $scope.fileList.filter(function (doc)
                {
                    return doc.docdDotdCdDocumento.__text == docdDotdCdDocumento;
                })
            };
        });
        $scope.sections = [];
        $.each($scope.fileList, function (index, doc)
        {
            if ($.inArray(doc.docdCdSeccion.__text, $scope.sections) === -1)
            {
                $scope.sections.push(doc.docdCdSeccion.__text);
            }
        });
        $scope.sections = $scope.sections.map(function (docdCdSeccion)
        {
            return {
                documents: $scope.documents.filter(function (doc)
                {
                    return doc.files[0].docdCdSeccion.__text == docdCdSeccion;
                })
            };
        });
    }
});

