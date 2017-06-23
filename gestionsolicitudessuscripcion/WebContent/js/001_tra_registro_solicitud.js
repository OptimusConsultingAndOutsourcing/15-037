SOAPGateway.controller("001_tra_registro_solicitud", function ($scope, Gateway, SOAPRequestMessage)
{
    Gateway.get({ UddiServiceRegistryName: "ServicioSolicitudesSuscripcion", OperationElementName: "generarSolicitudSol" }, function (operation)
    {
        $scope.generarSolicitud = operation;

        Gateway.get({ UddiServiceRegistryName: "ServicioUsuarios", OperationElementName: "buscarDatosUsuarioSol" }, function (operation)
        {
            
            operation.$post(function (response)
            {
                if(usuario.codAplicacion == "PORTASESOR")
                {
                    $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnNmPersonaContacto.__text = response.datos.filter(function(dato)
                    {
                        return dato.geetNmDato.__text == "NM_PRODUCTOR";
                    })
                    [0].geetValorDato.__text;

                    $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdEmail1Contacto.__text = response.datos.filter(function(dato)
                    {
                        return dato.geetNmDato.__text == "CD_MAIL_PROD";
                    })
                    [0].geetValorDato.__text;
                }
            });
        });

        Gateway.get({ UddiServiceRegistryName: "ServicioUtilities", OperationElementName: "listarRefCodesSol" }, function (operation)
        {
            operation.Envelope.Body.listarRefCodesSol.dominio.__text = "LINEA_DE_NEGOCIO";
            operation.$post(function (response)
            {
                $scope.lineas = response.valorRetorno ? response.valorRetorno.cgRefCodes : [];

                Gateway.get({ UddiServiceRegistryName: "ServicioUtilities", OperationElementName: "listarRefCodesSol" }, function (operation)
                {
                    operation.Envelope.Body.listarRefCodesSol.dominio.__text = "CART_POLIZAS.CAPO_TP_POLIZA";
                    operation.$post(function (response)
                    {
                        $scope.tiposPoliza = response.valorRetorno.cgRefCodes;

                        Gateway.get({ UddiServiceRegistryName: "http://slopr03123.mercantilseguros.com:17011/underlying/oracledb/rector/servicioramos/ServicioRamos", OperationElementName: "listarRamosSolicitudesSol" }, function (operation)
                        {
                            $scope.listarRamos = function ()
                            {
                                if ($scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdLineNegocio.__text
                                    && $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnTpPoliza.__text)
                                {
                                    operation.Envelope.Body.listarRamosSolicitudesSol.lineaNegocio.__text = $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdLineNegocio.__text;
                                    operation.Envelope.Body.listarRamosSolicitudesSol.tpPoliza.__text = $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnTpPoliza.__text;

                                    Gateway.post(operation, function (response)
                                    {
                                        delete response.poListaRamos.__prefix;
                                        $scope.ramos = response.poListaRamos;
                                    });
                                }
                            }
                        });
                    });
                });
            });
        });

        Gateway.get({ UddiServiceRegistryName: "ServicioSucursales", OperationElementName: "listarSucursalesSol" }, function (operation)
        {
            operation.Envelope.Body.listarSucursalesSol.inOrden.__text = "DE";
            operation.Envelope.Body.listarSucursalesSol.inFuncionalidad.__text = "GS";
            operation.$post(function (response)
            {
                $scope.sucursales = response.valorRetorno.cartSucursal;

                if(usuario.codAplicacion == "PORTASESOR")
                {
                    $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnNmPersonaContacto.__text = response.datos.filter(function(dato)
                    {
                        return dato.geetNmDato.__text == "NM_PRODUCTOR";
                    })
                    [0].geetValorDato.__text;
                }
            });
        });

        Gateway.get({ UddiServiceRegistryName: "ServicioMonedas", OperationElementName: "listarMonedasSolicitudesSol" }, function (operation)
        {
            operation.$post(function (response)
            {
                $scope.monedas = response.poListaMonedas.poListaMonedasItem;
            });
        });

        Gateway.get({ UddiServiceRegistryName: "ServicioSolicitudesSuscripcion", OperationElementName: "listarIndolesSol" }, function (operation)
        {
            operation.$post(function (response)
            {
                $scope.indoles = response.poListaIndoles.polistarIndolesItem;
            });
        });

        Gateway.get({ UddiServiceRegistryName: "ServicioUtilities", OperationElementName: "listarRefCodesSol" }, function (operation)
        {
            operation.Envelope.Body.listarRefCodesSol.dominio.__text = "NACIONALIDAD";
            operation.Envelope.Body.listarRefCodesSol.lowValue.__text = "'V','E','J'";
            operation.$post(function (response)
            {
                $scope.nacionalidades = response.valorRetorno.cgRefCodes;
            });
        });

        Gateway.get({ UddiServiceRegistryName: "ServicioUtilities", OperationElementName: "listarCodigoAreaSol" }, function (operation)
        {
            operation.Envelope.Body.listarCodigoAreaSol.cacgInCelular.__text = "N";
            operation.$post(function (response)
            {
                $scope.codigosArea = response.valorRetorno.cartCodigoArea;
            });
        });

        Gateway.get({ UddiServiceRegistryName: "ServicioUtilities", OperationElementName: "listarCodigoAreaSol" }, function (operation)
        {
            operation.Envelope.Body.listarCodigoAreaSol.cacgInCelular.__text = "S";
            operation.$post(function (response)
            {
                $scope.codigosCelular = response.valorRetorno.cartCodigoArea;
            });
        });
    });
});

