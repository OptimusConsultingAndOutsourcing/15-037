SOAPGateway.controller("BusquedaAsegurados", function ($scope, $http, Gateway, SOAPRequestMessage)
{
    Gateway.get({ UddiServiceRegistryName: "ServicioBeneficiarios", OperationElementName: "listarBeneficiariosSolicitudSol" }, function (operation)
    {
        $scope.soapRequestMessage = operation;
        $scope.buscarAsegurados = function ()
        {
            if ($scope.soapRequestMessage.Envelope.Body.listarBeneficiariosSolicitudSol.piNuCedula.__text && $scope.soapRequestMessage.Envelope.Body.listarBeneficiariosSolicitudSol.piCdNacionalidad.__text)
            {
                $scope.soapRequestMessage.Envelope.Body.listarBeneficiariosSolicitudSol.piCdUsuario.__text = $scope.soapRequestMessage.Envelope.Body.listarBeneficiariosSolicitudSol.cabeceraSol.usuario.__text = $scope.soapRequestMessage.Envelope.Body.listarBeneficiariosSolicitudSol.piCdNacionalidad.__text + $scope.soapRequestMessage.Envelope.Body.listarBeneficiariosSolicitudSol.piNuCedula.__text;
                $scope.soapRequestMessage.$post(function (response)
                {
                    $scope.listaBeneficiarios = response;
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
                });
            }
        }
    });
    //$http.get("templates/listarRefCodes.xml").then(
    Gateway.get({
		UddiServiceRegistryName: "http://slopr03123.mercantilseguros.com:17011/underlying/oracledb/rector/ServicioUtilities/ServicioUtilities",
		OperationElementName: "listarRefCodesSol"
	}, function (operation)
    {
        //var operation = SOAPRequestMessage.fromTemplate(response);
        operation.Envelope.Body.listarRefCodesSol.dominio.__text = "NACIONALIDAD";
        Gateway.post(operation, function (response)
        {
            $scope.nacionalidades = response.valorRetorno.cgRefCodes;
        });
    });
});
