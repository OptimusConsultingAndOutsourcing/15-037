SOAPGateway.controller("BusquedaAsegurados", function ($scope, Gateway, SOAPRequestMessage)
{
    $.get("templates/listarBenefiariosSolicitud.xml", function (template)
    {
        $scope.soapRequestMessage = SOAPRequestMessage.fromTemplate(template);
        fillParameters($scope.soapRequestMessage);
        $scope.$apply();
        $scope.buscarAsegurados = function ()
        {
            if ($scope.soapRequestMessage.Envelope.Body.listarBeneficiariosSolicitudSol.piNuCedula.__text && $scope.soapRequestMessage.Envelope.Body.listarBeneficiariosSolicitudSol.piCdNacionalidad.__text)
            {
                $scope.soapRequestMessage.Envelope.Body.listarBeneficiariosSolicitudSol.piCdUsuario.__text = $scope.soapRequestMessage.Envelope.Body.listarBeneficiariosSolicitudSol.cabeceraSol.usuario.__text = $scope.soapRequestMessage.Envelope.Body.listarBeneficiariosSolicitudSol.piCdNacionalidad.__text + $scope.soapRequestMessage.Envelope.Body.listarBeneficiariosSolicitudSol.piNuCedula.__text;
                Gateway.post($.param({
                    SOAPRequestMessage: $scope.soapRequestMessage.toXMLString(),
                    UddiServiceRegistryName: "ServicioBeneficiarios"
                }),
                    function (response)
                    {
                        $scope.listaBeneficiarios = response.Envelope.Body.listarBeneficiariosSolicitudRes;
                        if (!$scope.listaBeneficiarios.carcListaBenef)
                        {
                            $.alert({
                                title: 'Alerta!',
                                content: 'No se encontraron beneficiarios correspondientes a los datos indicados!',
                            });
                        }
                        else
                        {
                            $scope.listaBeneficiarios = $scope.listaBeneficiarios.carcListaBenef.caroListaBenefArray;
                        }
                    },
                    function (response)
                    {
                        console.log(response.data);
                        window.location.replace("error.html");
                    });
            }
        }
    });
    $.get("templates/listarRefCodes.xml", function (template)
    {
        Gateway.post($.param({
            SOAPRequestMessage: template,
            UddiServiceRegistryName: "ServicioUtilities"
        }),
            function (response)
            {
                $scope.nacionalidades = response.Envelope.Body.listarRefCodesRes.valorRetorno.cgRefCodes;
            },
            function (response)
            {
                console.log(response.data);
                window.location.replace("error.html");
            });
    });
});
