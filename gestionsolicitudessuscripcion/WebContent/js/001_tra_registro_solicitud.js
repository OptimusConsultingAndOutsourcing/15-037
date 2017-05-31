SOAPGateway.controller("001_tra_registro_solicitud", function ($scope, Gateway, SOAPRequestMessage)
{
    $.get("templates/generarSolicitud.xml", function (template)
    {
        $scope.generarSolicitudRequestMessage = SOAPRequestMessage.fromTemplate(template);

        $.get("templates/buscarDatosUsuario.xml", function (template)
        {
            Gateway.post($.param({ SOAPRequestMessage: SOAPRequestMessage.fromTemplate(template).toXMLString(), UddiServiceRegistryName: "ServicioUsuarios" }), function (response)
            {
            });
        });

        $.get("templates/listarRefCodes.xml", function (template)
        {
            Gateway.post($.param({ SOAPRequestMessage: SOAPRequestMessage.fromTemplate(template).toXMLString(), UddiServiceRegistryName: "ServicioUtilities" }), function (response)
            {
                $scope.lineas = response.valorRetorno.cgRefCodes;
            });
        });

        $.get("templates/listarTipoPoliza.xml", function (template)
        {
            Gateway.post($.param({ SOAPRequestMessage: SOAPRequestMessage.fromTemplate(template).toXMLString(), UddiServiceRegistryName: "ServicioUtilities" }), function (response)
            {
                $scope.tiposPoliza = response.valorRetorno.cgRefCodes;
            });
        });

        $.get("templates/listarRamosSolicitudes.xml", function (template)
        {
            $scope.listarRamosSolicitudesSOAPRequestMessage = SOAPRequestMessage.fromTemplate(template);
            
            $scope.listarRamos = function()
            {
                if ($scope.generarSolicitudRequestMessage.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdLineNegocio.__text
                && $scope.generarSolicitudRequestMessage.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnTpPoliza.__text)
                {
                    $scope.listarRamosSolicitudesSOAPRequestMessage.Envelope.Body.listarRamosSolicitudesSol.lineaNegocio.__text = $scope.generarSolicitudRequestMessage.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdLineNegocio.__text;
                    $scope.listarRamosSolicitudesSOAPRequestMessage.Envelope.Body.listarRamosSolicitudesSol.tpPoliza.__text = $scope.generarSolicitudRequestMessage.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnTpPoliza.__text;
            
                    Gateway.post($.param({ SOAPRequestMessage: $scope.listarRamosSolicitudesSOAPRequestMessage.toXMLString(), UddiServiceRegistryName: "ServicioRamos" }), function (response)
                    {
                        $scope.ramos = response.poListaRamos;
                    });
                }
            }
        });

        $.get("templates/listarSucursales.xml", function (template)
        {
            Gateway.post($.param({ SOAPRequestMessage: SOAPRequestMessage.fromTemplate(template).toXMLString(), UddiServiceRegistryName: "ServicioSucursales" }), function (response)
            {
                $scope.sucursales = response.valorRetorno.cartSucursal;
            });
        });
    });
});

