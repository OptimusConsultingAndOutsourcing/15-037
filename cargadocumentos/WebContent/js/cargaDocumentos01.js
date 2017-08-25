SOAPGateway.controller("Carga", function ($scope)
{
    $scope.template = window.location.href.replace(window.location.pathname.split("/")[2], "cargaDocumentosViewTemplate.html");
});

SOAPGateway.controller("CargaTemplateCtrl", function ($scope, Gateway)
{
    $scope.listarRecaudos = function()
    {
        $scope.listarRecaudosSolicitudSol.Envelope.Body.listarRecaudosSolicitudSol.piFuncionalidad.__text = "CARGA_DOC";
        $scope.listarRecaudosSolicitudSol.Envelope.Body.listarRecaudosSolicitudSol.piAplicacion.__text = "GEST_DOCU";
        Gateway.post($scope.listarRecaudosSolicitudSol, function (response)
        {
            if ((response.poSalida == "0") && (response.poListaConsulta.docoListaConsulta))
            {
                var id = 0;
                $scope.fileList = response.poListaConsulta.docoListaConsulta.map(function (file)
                {
                    file.doecNmArchivoFs = encodeURIComponent(file.doecNmArchivoFs);
                    file.id = id;
                    file.loaded = !!file.doecNmArchivoFs;
                    id++;
                    return file;
                });
                $scope.builtree();
            }
        });
    };

    Gateway.get({ UddiServiceRegistryName: "http://slopr03123.mercantilseguros.com:17011/underlying/oracledb/rector/serviciorecaudos/ServicioRecaudos", OperationElementName: "validarUploadSol" }, function (operation)
    {
        $scope.validarUploadRequestMessage = operation;
        $scope.validarUploadRequestMessage.Envelope.Body.validarUploadSol.piFuncionalidad.__text = "CARGA_DOC";
        $scope.validarUploadRequestMessage.Envelope.Body.validarUploadSol.piAplicacion.__text = "GEST_DOCU";

        Gateway.get({ UddiServiceRegistryName: "http://slopr03123.mercantilseguros.com:17011/underlying/oracledb/rector/serviciorecaudos/ServicioRecaudos", OperationElementName: "actualizarRecaudoSol" }, function (operation)
        {
            $scope.actualizarRecaudoRequestMessage = operation;
            $scope.actualizarRecaudoRequestMessage.Envelope.Body.actualizarRecaudoSol.piFuncionalidad.__text = "CARGA_DOC";
            $scope.actualizarRecaudoRequestMessage.Envelope.Body.actualizarRecaudoSol.piAplicacion.__text = "GEST_DOCU";

            Gateway.get({ UddiServiceRegistryName: "http://slopr03123.mercantilseguros.com:17011/underlying/oracledb/rector/serviciorecaudos/ServicioRecaudos", OperationElementName: "listarRecaudosSolicitudSol" }, function (operation)
            {
                $scope.listarRecaudosSolicitudSol = operation;
                $scope.listarRecaudos();
            });
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
                    doc.files.sort(function(a, b) 
                    {
                        return a.doecNuConsecutivo - b.doecNuConsecutivo;
                    });

                    if( doc.files.filter(function(file)
                        { 
                            return file.docdNuRepeticiones == file.doecNuConsecutivo;
                        })
                        .length <= 0)
                    {
                        doc.files[doc.files.length - 1].showDuplicateButton = true;
                    }

                    return doc.files[0].docdCdSeccion == docdCdSeccion;
                })
            };
        });
    };

    var file;
    var form;
    var fileInfo;

    $scope.upload = function ($event, fileInputId, fileInfo)
    {
        var event = $event;

        file = document.getElementById(fileInputId).files[0];
        form = event.target;
        fileInfo = fileInfo;

        $scope.validarUploadRequestMessage.Envelope.Body.validarUploadSol.piTpExpediente.__text = fileInfo.docdDoteCdTipExpediente;
        $scope.validarUploadRequestMessage.Envelope.Body.validarUploadSol.piCdExpediente.__text = fileInfo.docdDoteCdExpediente;
        $scope.validarUploadRequestMessage.Envelope.Body.validarUploadSol.piCdDocumento.__text = fileInfo.docdDotdCdDocumento;
        $scope.validarUploadRequestMessage.Envelope.Body.validarUploadSol.piCdExtension.__text = (file.name.match(/\./g) || []).length > 0 ? file.name.split('.')[(file.name.match(/\./g) || []).length] : "";
        $scope.validarUploadRequestMessage.Envelope.Body.validarUploadSol.piNuSize.__text = file.size;

        Gateway.post($scope.validarUploadRequestMessage, function (response)
        {
            var validarUploadRes = response;
            if (validarUploadRes.cabeceraRes && !validarUploadRes.cabeceraRes.estatusError && validarUploadRes.poCdSalida == 0)
            {
                var xhr = new XMLHttpRequest();
                if (xhr.upload
                    //&& (file.type == "image/jpeg" || file.type == "image/gif" || file.type == "application/pdf")
                    //&& file.size <= 10485760 
                )
                {
                    var poDeRuta = validarUploadRes.poDeRuta;
                    fileInfo.piNmArchivoOriginal = file.name;
                    fileInfo.piDeFilesystem = validarUploadRes.poDeNameFs + "." + fileInfo.piNmArchivoOriginal.split(".")[fileInfo.piNmArchivoOriginal.split(".").length - 1];
                    fileInfo.filePath = encodeURIComponent(poDeRuta + fileInfo.piDeFilesystem);

                    xhr.open("POST", form.action, false);
                    xhr.onreadystatechange = function (oEvent)
                    {
                        //alert("turn off LOADING SCREEN");
                        if (xhr.status >= 400)
                        {
                            alert("No se pudo cargar el archivo, por favor intente de nuevo");
                            console.log(xhr.responseText);
                        }
                        else
                        {
                            $scope.actualizarRecaudo(fileInfo, "PUBLICAR", function(response){
                                fileInfo.loaded = true;

                                $scope.listarRecaudos();
                            });
                        }
                    }
                    var formData = new FormData();
                    formData.append("fileDirectory", poDeRuta);
                    formData.append("fileName", fileInfo.piDeFilesystem);
                    formData.append("thefile", file);
                    //alert("turn on LOADING SCREEN");
                    xhr.send(formData);
                }
                else
                {
                    alert("No se puede hacer upload en este momento.");
                }
            }
            else
            {
                if (validarUploadRes.cabeceraRes && validarUploadRes.cabeceraRes.estatusError)
                {
                    fileInfo.errorMessage = validarUploadRes.cabeceraRes.estatusError.descripcion;
                }
                else
                {
                    window.alert("Archivo invalido");
                }
            }
        }
        , function (response)
        {
            alert("No se pudo validar el archivo, por favor intente de nuevo.");
            console.log(response.data);
        });
        
        event.preventDefault();
    };

    $scope.deleteFile = function (formInputId, fileInfo)
    {
        $scope.actualizarRecaudo(fileInfo, "ELIMINAR", function(){
            document.getElementById(formInputId).reset();
            fileInfo.loaded = false;
            if (fileInfo.doecNuConsecutivo > 1)
            {
                delete fileInfo;
            }
        });
    };

    $scope.actualizarRecaudo = function (fileInfo, piTipoModi, callback)
    {
        var actualizarRecaudoSol = $scope.actualizarRecaudoRequestMessage.Envelope.Body.actualizarRecaudoSol;
        actualizarRecaudoSol.piCdExpediente.__text = fileInfo.dopnDoteCdExpediente;
        actualizarRecaudoSol.piTpExpediente.__text = fileInfo.dopnDoteCdTpExpediente;
        actualizarRecaudoSol.piNuExpediente.__text = fileInfo.doedNuExpediente;
        actualizarRecaudoSol.piCdDocumento.__text = fileInfo.docdDotdCdDocumento;
        actualizarRecaudoSol.piNuConsecutivo.__text = fileInfo.doecNuConsecutivo;
        actualizarRecaudoSol.piNmArchivoOriginal.__text = fileInfo.piNmArchivoOriginal;
        actualizarRecaudoSol.piDeFilesystem.__text = fileInfo.piDeFilesystem;
        actualizarRecaudoSol.piFeRegistro.__text = new Date().toISOString().split("T")[0];
        actualizarRecaudoSol.piTipoModi.__text = piTipoModi;

        Gateway.post($scope.actualizarRecaudoRequestMessage, function (response)
        {
            if(response.poCdSalida == 0)
            {
                callback(response);
            }
            else
            {
                if(response.cabeceraRes && response.cabeceraRes.estatusError && response.cabeceraRes.estatusError.codigo == 2)
                {
                    if (fileInfo.doecNuConsecutivo > 1)
                    {
                        $.each($scope.sections, function (index, section)
                        {
                            $.each(section.documents, function (index, doc)
                            {
                                doc.files = doc.files.filter(function(file)
                                {
                                    return file.doecNmArchivoFs !== fileInfo.doecNmArchivoFs;
                                });
                            });
                        });
                    }
                    
                    //delete fileInfo;

                    alert(response.cabeceraRes.estatusError.descripcion);
                    console.log(response.cabeceraRes.estatusFinal);
                }
                else
                {
                    alert("Servicio no disponible, por favor intente mas tarde.");
                    console.log(response.cabeceraRes.estatusFinal);
                }
            }
        }
        , function (response) 
        {
            alert("Servicio no disponible, por favor intente mas tarde.");
            console.log(response.data);
        });
    };

    $scope.duplicateFile = function(doc, file)
    {
        delete file.showDuplicateButton;
        
        var copy = jQuery.extend({}, file);
        copy.loaded = false;
        copy.doecNuConsecutivo = parseInt(file.doecNuConsecutivo) + 1;
        copy.showDuplicateButton = copy.docdNuRepeticiones != copy.doecNuConsecutivo;

        doc.files.push(copy);
    };

    $scope.unload = function(file)
    {
        file.loaded = false;
    };

    $scope.selectedFile = function(event, file)
    {
        var filename = event.target.value;
        if (filename) {
            var startIndex = (filename.indexOf('\\') >= 0 ? filename.lastIndexOf('\\') : filename.lastIndexOf('/'));
            var filename = filename.substring(startIndex);
            if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
                filename = filename.substring(1);
            }
        }
        file.doecNmArchivoOriginal = filename;
        $scope.$apply();
    };

});
