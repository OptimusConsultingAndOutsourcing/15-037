SOAPGateway.controller("Carga", function ($scope, Gateway, SOAPRequestMessage)
{
    $.get("templates/validarUpload.xml", function (template)
    {
        $scope.soapRequestMessage = SOAPRequestMessage.fromTemplate(template);
        fillParameters($scope.soapRequestMessage);
        Gateway.post($.param({
            SOAPRequestMessage: $scope.soapRequestMessage.toXMLString(),
            UddiServiceRegistryName: "ServicioRecaudos"
        })
            , function (response)
            {
                $scope.poDeRuta = response.Envelope.Body.validarUploadRes.poDeRuta.__text;
            }
            , function (response)
            {
                console.log(response.data);
                window.location.replace("error.html");
            });
    });

    $.get("templates/listarRecaudosSolicitud.xml", function (template)
    {
        $scope.soapRequestMessage = SOAPRequestMessage.fromTemplate(template);
        fillParameters($scope.soapRequestMessage);
        Gateway.post($.param({
            SOAPRequestMessage: $scope.soapRequestMessage.toXMLString(),
            UddiServiceRegistryName: "ServicioRecaudos"
        })
            , function (response)
            {
                if ((response.Envelope.Body.listarRecaudosSolicitudRes.poSalida)
                    && (response.Envelope.Body.listarRecaudosSolicitudRes.poSalida.__text == "0")
                    && (response.Envelope.Body.listarRecaudosSolicitudRes.poListaConsulta.docoListaConsulta))
                {
                    var id = 0;
                    $scope.fileList = response.Envelope.Body.listarRecaudosSolicitudRes.poListaConsulta.docoListaConsulta.map(function (file)
                    {
                        file.doecNmArchivoFs = encodeURIComponent(file.doecNmArchivoFs);
                        file.id = id;
                        id++;
                        return file;
                    });
                    $scope.builtree();
                }
            }
            , function (response)
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

    $scope.uploadFile = function (inputFileId)
    {
        //alert(inputFileId);
        $scope.upload(document.getElementById(inputFileId).files[0], event.target)
        event.preventDefault();
    }

    $scope.upload = function (file, form)
    {
        var xhr = new XMLHttpRequest();
        if (xhr.upload && (file.type == "image/jpeg" || file.type == "image/gif" || file.type == "application/pdf")
            && file.size <= 10485760 /* 10 MB */)
        {
            xhr.open("POST", form.action, true);
            xhr.setRequestHeader("X_FILENAME", file.name);
            xhr.onreadystatechange = function ()
            {
                if (oXHR.status === 200)
                {
                    console.log(oXHR.responseText)
                }
            }
            xhr.send(file);
        }
        else
        {
            alert("Solo puede adjuntar archivos .jpg, .gif o .pdf de hasta 10 MB.");
        }
    }


});

