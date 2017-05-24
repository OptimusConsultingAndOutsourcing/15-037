SOAPGateway.controller("Carga", function ($scope, Gateway, SOAPRequestMessage)
{
    $.get("templates/validarUpload.xml", function (validarUploadTemplate)
    {
        Gateway.post($.param({
            SOAPRequestMessage: SOAPRequestMessage.fromTemplate(validarUploadTemplate).toXMLString(),
            UddiServiceRegistryName: "ServicioRecaudos"
        })
            , function (response)
            {
                $scope.poDeRuta = response.Envelope.Body.validarUploadRes.poDeRuta.__text;

                $.get("templates/actualizarRecaudo.xml", function (actualizarRecaudoTemplate)
                {
                    $.get("templates/listarRecaudosSolicitud.xml", function (listarRecaudosSolicitudTemplate)
                    {
                        Gateway.post($.param({ 
                            SOAPRequestMessage: SOAPRequestMessage.fromTemplate(listarRecaudosSolicitudTemplate).toXMLString(),
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
                                        file.actualizarRecaudoRequestMessage = SOAPRequestMessage.fromTemplate(actualizarRecaudoTemplate);
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
                });
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

    $scope.upload = function (fileInputId, doc)
    {
        event.preventDefault();

        var file = document.getElementById(fileInputId).files[0];
        var xhr = new XMLHttpRequest();
        if (xhr.upload && (file.type == "image/jpeg" || file.type == "image/gif" || file.type == "application/pdf")
            && file.size <= 10485760 /* 10 MB */)
        {
            doc.fileName = $scope.poDeRuta + file.name;
            xhr.open("POST", event.target.action, false);
            xhr.onreadystatechange = function (oEvent)
            {
                // turn off LOADING SCREEN
                if (xhr.status >= 400)
                {
                    alert("No se pudo cargar el archivo, por favor intente de nuevo");
                    console.log(xhr.responseText)
                }
                else
                {
                    //file
                    doc.loaded = true;
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

    $scope.deleteFile = function (formInputId, doc)
    {
        doc.files[0].actualizarRecaudoRequestMessage.Envelope.Body.actualizarRecaudoSol.piNuExpediente.__text = doc.files[0].doedNuExpediente.__text;
        doc.files[0].actualizarRecaudoRequestMessage.Envelope.Body.actualizarRecaudoSol.piCdDocumento.__text = doc.files[0].docdDotdCdDocumento.__text;
        doc.files[0].actualizarRecaudoRequestMessage.Envelope.Body.actualizarRecaudoSol.piNuConsecutivo.__text = doc.files[0].doecNuConsecutivo.__text;

        Gateway.post($.param({
            SOAPRequestMessage: doc.files[0].actualizarRecaudoRequestMessage.toXMLString(),
            UddiServiceRegistryName: "ServicioRecaudos"
        })
            , function (response)
            {
                document.getElementById(formInputId).reset();
                doc.loaded = false;
            }
            , function (response)
            {
                alert("No se pudo eliminar el documento, por favor intente de nuevo.");
                console.log(response.data);
            });
    }

});

