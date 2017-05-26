SOAPGateway.controller("Carga", function ($scope, Gateway, SOAPRequestMessage)
{
    $.get("templates/validarUpload.xml", function (validarUploadTemplate)
    {
        $scope.validarUploadRequestMessage = SOAPRequestMessage.fromTemplate(validarUploadTemplate);

        $.get("templates/actualizarRecaudo.xml", function (actualizarRecaudoTemplate)
        {
            $scope.actualizarRecaudoRequestMessage = SOAPRequestMessage.fromTemplate(actualizarRecaudoTemplate);

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

    var file;
    var form;

    $scope.upload = function (fileInputId, doc)
    {
        event.preventDefault();

        file = document.getElementById(fileInputId).files[0];
        form = event.target;

        $scope.validarUploadRequestMessage.Envelope.Body.validarUploadSol.piTpExpediente.__text = doc.files[0].docdDoteCdTipExpediente.__text;
        $scope.validarUploadRequestMessage.Envelope.Body.validarUploadSol.piCdExpediente.__text = doc.files[0].docdDoteCdExpediente.__text;
        $scope.validarUploadRequestMessage.Envelope.Body.validarUploadSol.piCdDocumento.__text = doc.files[0].docdDotdCdDocumento.__text;
        $scope.validarUploadRequestMessage.Envelope.Body.validarUploadSol.piCdExtension.__text = (file.name.match(/\./g) || []).length > 0 ? file.name.split('.')[(file.name.match(/\./g) || []).length] : "";
        $scope.validarUploadRequestMessage.Envelope.Body.validarUploadSol.piNuSize.__text = file.size;

        Gateway.post($.param({
            SOAPRequestMessage: $scope.validarUploadRequestMessage.toXMLString(),
            UddiServiceRegistryName: "ServicioRecaudos"
        })
            , function (response)
            {
                var validarUploadRes = response.Envelope.Body.validarUploadRes;
                if (validarUploadRes.cabeceraRes && !validarUploadRes.cabeceraRes.estatusError 
                    && validarUploadRes.poCdSalida && validarUploadRes.poCdSalida.__text == 0)
                {
                    var xhr = new XMLHttpRequest();
                    if (xhr.upload
                        //&& (file.type == "image/jpeg" || file.type == "image/gif" || file.type == "application/pdf")
                        //&& file.size <= 10485760 
                    )
                    {
                        var poDeRuta = validarUploadRes.poDeRuta.__text;
                        doc.files[0].piNmArchivoOriginal = file.name;
                        doc.files[0].piDeFilesystem = validarUploadRes.poDeNameFs.__text;
                        doc.files[0].filePath = poDeRuta + doc.files[0].piDeFilesystem;

                        xhr.open("POST", form.action, false);
                        xhr.onreadystatechange = function (oEvent)
                        {
                            alert("turn off LOADING SCREEN");
                            if (xhr.status >= 400)
                            {
                                alert("No se pudo cargar el archivo, por favor intente de nuevo");
                                console.log(xhr.responseText);
                            }
                            else
                            {
                                $scope.actualizarRecaudo(doc, "PUBLICAR", function(){
                                    doc.files[0].loaded = true;
                                });
                            }
                        }
                        var formData = new FormData();
                        formData.append("poDeRuta", poDeRuta);
                        formData.append("thefile", file);
                        alert("turn on LOADING SCREEN");
                        xhr.send(formData);
                    }
                    else
                    {
                        alert("No se puede hacer upload en este momento.");
                    }
                }
                else
                {
                    window.alert("Archivo invalido");
                }
            }
            , function (response)
            {
                alert("No se pudo validar el archivo, por favor intente de nuevo.");
                console.log(response.data);
            });
    }

    $scope.deleteFile = function (formInputId, doc)
    {
        $scope.actualizarRecaudo(doc, "ELIMINAR", function(){
            document.getElementById(formInputId).reset();
            doc.files[0].loaded = false;
        });
    }

    $scope.actualizarRecaudo = function (doc, piTipoModi, callback)
    {
        var actualizarRecaudoSol = $scope.actualizarRecaudoRequestMessage.Envelope.Body.actualizarRecaudoSol;
        actualizarRecaudoSol.piCdExpediente.__text = doc.files[0].dopnDoteCdExpediente.__text;
        actualizarRecaudoSol.piTpExpediente.__text = doc.files[0].dopnDoteCdTpExpediente.__text;
        actualizarRecaudoSol.piNuExpediente.__text = doc.files[0].doedNuExpediente.__text;
        actualizarRecaudoSol.piCdDocumento.__text = doc.files[0].docdDotdCdDocumento.__text;
        actualizarRecaudoSol.piNuConsecutivo.__text = doc.files[0].doecNuConsecutivo.__text;
        actualizarRecaudoSol.piNmArchivoOriginal.__text = doc.files[0].piNmArchivoOriginal;
        actualizarRecaudoSol.piDeFilesystem.__text = doc.files[0].piDeFilesystem;
        actualizarRecaudoSol.piFeRegistro.__text = new Date().toISOString().split("T")[0];
        actualizarRecaudoSol.piTipoModi.__text = piTipoModi;

        Gateway.post($.param({
            SOAPRequestMessage: $scope.actualizarRecaudoRequestMessage.toXMLString(),
            UddiServiceRegistryName: "ServicioRecaudos"
        })
            , function (response)
            {
                if(response.Envelope.Body.actualizarRecaudoRes.poCdSalida.__text == 0)
                {
                    callback();
                }
                else
                {
                    alert("Servicio no disponible, por favor intente de nuevo.");
                    console.log(response.cabeceraRes.estatusFinal.__text);
                }
            }
            , function (response) 
            {
                alert("Servicio no disponible, por favor intente de nuevo.");
                console.log(response.data);
            });
    }

});
