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

    $scope.upload = function (fileInputId)
    {
        event.preventDefault();

        var file = document.getElementById(fileInputId).files[0];
        var xhr = new XMLHttpRequest();
        if (xhr.upload && (file.type == "image/jpeg" || file.type == "image/gif" || file.type == "application/pdf")
            && file.size <= 10485760 /* 10 MB */)
        {
            xhr.open("POST", event.target.action, false);
            xhr.onreadystatechange = function (oEvent)
            {
                // turn off LOADING SCREEN
                if (xhr.status !== 200)
                {
                    alert("No se pudo cargar el archivo, por favor intente de nuevo");
                    console.log(xhr.responseText)
                }
            }
            var formData = new FormData();
            formData.append("poDeRuta", $scope.poDeRuta);
            formData.append("thefile", file);
            // turn on LOADING SCREEN
            xhr.send(formData);
        }
        else
        {
            alert("Solo puede adjuntar archivos .jpg, .gif o .pdf de hasta 10 MB.");
        }
    }


});

