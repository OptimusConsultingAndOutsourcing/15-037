SOAPGateway.controller("Visor", function ($scope, Gateway, SOAPRequestMessage)
{
    $.get("templates/ConsultarDocumentosSOAPRequestMessageTemplate.xml", function (template)
    {
        $scope.soapRequestMessage = SOAPRequestMessage.fromTemplate(template);
        var consultarDocumentosSol = $scope.soapRequestMessage.Envelope.Body.consultarDocumentosSol;
        var date = new Date();
        date.setTime(date.getTime() - (date.getTimezoneOffset() * 60 * 1000));
        consultarDocumentosSol.cabeceraSol.fecha.__text = date.toISOString().split("T")[0];
        consultarDocumentosSol.cabeceraSol.hora.__text = date.toISOString().split("T")[1].split(".")[0];
        consultarDocumentosSol.piTpExpediente = getParameter('tpExpediente') || 'SIN'; 
        consultarDocumentosSol.piCdExpediente = getParameter('cdExpediente') || 'REEM'; 
        consultarDocumentosSol.piNuSolicitud = getParameter( 'nuSol') || '1'; 
        consultarDocumentosSol.piValorRaiz = getParameter(   'valorRaiz') || '1-340280904'; 
        Gateway.post($.param({
                    SOAPRequestMessage: $scope.soapRequestMessage.toXMLString(),
                    UddiServiceRegistryName: "ServicioRecaudos"
                })
        , function (response)
        {
            if ((response.Envelope.Body.consultarDocumentosRes.poSalida)
            && (response.Envelope.Body.consultarDocumentosRes.poSalida == 0)
            && (response.Envelope.Body.consultarDocumentosRes.poListaConsulta.docoListaConsulta))
            {
                var id = 0;
                $scope.fileList = response.Envelope.Body.consultarDocumentosRes.poListaConsulta.docoListaConsulta.map(function (file)
                {
                    file.doecNmArchivoFs = encodeURIComponent(file.doecNmArchivoFs);
                    file.id = id;
                    id++;
                    return file;
                });
                $scope.builtree();
            }
        }, function (response)
            {
                console.log(response.data);
                window.location.replace("error.html");
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
});

