SOAPGateway.controller("001_tra_registro_solicitud", function ($scope, Gateway, SOAPRequestMessage)
{
	Gateway.get({
		UddiServiceRegistryName: "http://slopr03123.mercantilseguros.com:17011/underlying/oracledb/rector/serviciosolicitudessuscripcion/ServicioSolicitudesSuscripcion",
		OperationElementName: "generarSolicitudSol"
	}, function (operation)
		{
			$scope.generarSolicitud = operation;

			if (getQueryString("NuSolicitud"))
			{
				Gateway.get({ UddiServiceRegistryName: "http://slopr03123.mercantilseguros.com:17011/underlying/oracledb/rector/serviciosolicitudessuscripcion/ServicioSolicitudesSuscripcion", OperationElementName: "listarSolicitudesSol" }, function (operation)
				{
					operation.Envelope.Body.listarSolicitudesSol.CdFuncionalidad.__text = "GSSC";

					operation.$post(function (response)
					{
						if(response.cabeceraRes.estatusError && response.cabeceraRes.estatusFinal == "fallonegocio")
						{
							$.alert({
								title: 'Alerta!',
								content: response.cabeceraRes.estatusError.descripcion,
							});
						}
						else
						{
							$scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCapuCarpCdRamo.__text = response.poListaSolicitudes.polistarSolicitudesItem.sosuCapuCarpCdRamo;
							$scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdProducto.__text = response.poListaSolicitudes.polistarSolicitudesItem.sosuCapuCdProducto;
							$scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdSucursal.__text = response.poListaSolicitudes.polistarSolicitudesItem.sosuCasuCdSucursal;
							$scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdAreaHabSol.__text = response.poListaSolicitudes.polistarSolicitudesItem.sosuCdAreaHabSol;
							$scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdEmail1Sol.__text = response.poListaSolicitudes.polistarSolicitudesItem.sosuCdEmail1Sol;
							$scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdLineNegocio.__text = response.poListaSolicitudes.polistarSolicitudesItem.sosuCdLineaNegocio;
							$scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdNacionalidadSol.__text = response.poListaSolicitudes.polistarSolicitudesItem.sosuCdNacionalidadSol;
							$scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnTpPoliza.__text = response.poListaSolicitudes.polistarSolicitudesItem.sosuTpPoliza;
							$scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnTpSolicitud.__text = response.poListaSolicitudes.polistarSolicitudesItem.sosuTpSolicitud;
							$scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnNmPersonaContacto.__text = response.poListaSolicitudes.polistarSolicitudesItem.sosuNmPersonaContacto;
							$scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnNmSolicitante.__text = response.poListaSolicitudes.polistarSolicitudesItem.sosuNmSolicitante;
							$scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnNuCedulaSol.__text = response.poListaSolicitudes.polistarSolicitudesItem.sosuNuCedulaSol;
							$scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnNuTelefonoHabSol.__text = response.poListaSolicitudes.polistarSolicitudesItem.sosuNuTelefonoHabSol;
							$scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnNuSolicitud.__text = response.poListaSolicitudes.polistarSolicitudesItem.sosuSolsNuSolicitud;
							$scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnTpMovimiento.__text = response.poListaSolicitudes.polistarSolicitudesItem.sosuTpMovimiento;
						}
					});
				});
			}
			else
			{
				$scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnInReferidos.__text = "no";
				$scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnInLicitacion.__text = "no";
				$scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnInTomador.__text = "no";
			}

			Gateway.get({
				UddiServiceRegistryName: "http://slopr03123.mercantilseguros.com:17011/underlying/oracledb/rector/serviciousuarios/ServicioUsuarios",
				OperationElementName: "buscarDatosUsuarioSol"
			}, function (operation)
				{
					operation.$post(function (response)
					{
						$scope.usuario = response;

						Gateway.get({
							UddiServiceRegistryName: "http://slopr03123.mercantilseguros.com:17011/underlying/oracledb/rector/serviciosucursales/ServicioSucursales",
							OperationElementName: "listarSucursalesSol"
						}, function (operation)
							{
								operation.Envelope.Body.listarSucursalesSol.inOrden.__text = "DE";
								operation.Envelope.Body.listarSucursalesSol.inFuncionalidad.__text = "GS";
								operation.$post(function (response)
								{
									$scope.sucursales = response.valorRetorno ? [].concat(response.valorRetorno.cartSucursal).map(function (element)
									{
										element.value = element.casuCdSucursal;
										element.label = element.casuDeSucursal;
										return element;
									}) : [];

									if (usuario.codAplicacion == "PORTASESOR")
									{
										var dato = $scope.usuario.datos.filter(function (dato)
										{
											return dato.geetNmDato == "CD_SUC_PRODUCTOR";
										});
										$scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdSucursal.__text = dato[0] ? dato[0].geetValorDato : null;

										var dato = $scope.usuario.datos.filter(function (dato)
										{
											return dato.geetNmDato == "NM_PRODUCTOR";
										});
										$scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnNmPersonaContacto.__text = dato[0] ? dato[0].geetValorDato : null;

										var dato = $scope.usuario.datos.filter(function (dato)
										{
											return dato.geetNmDato == "CD_MAIL_PROD";
										});
										$scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdEmail1Contacto.__text = dato[0] ? dato[0].geetValorDato : null;

										var dato = $scope.usuario.datos.filter(function (dato)
										{
											return dato.geetNmDato == "NU_AREA_CEL";
										});
										$scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdAreaCelContacto.__text = dato[0] ? dato[0].geetValorDato : null;

										var dato = $scope.usuario.datos.filter(function (dato)
										{
											return dato.geetNmDato == "NU_CELULAR";
										});
										$scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnNuCelularContacto.__text = dato[0] ? dato[0].geetValorDato : null;
									}
								});
							});
					});
				});

			Gateway.get({
				UddiServiceRegistryName: "http://slopr03123.mercantilseguros.com:17011/underlying/oracledb/rector/ServicioUtilities/ServicioUtilities",
				OperationElementName: "listarRefCodesSol"
			}, function (operation)
				{
					operation.Envelope.Body.listarRefCodesSol.dominio.__text = "LINEA_DE_NEGOCIO";
					operation.$post(function (response)
					{
						$scope.lineas = response.valorRetorno ? [].concat(response.valorRetorno.cgRefCodes).map(function (element)
						{
							element.value = element.rvLowValue;
							element.label = element.rvMeaning;
							return element;
						}) : [];
					});
				});

			Gateway.get({
				UddiServiceRegistryName: "http://slopr03123.mercantilseguros.com:17011/underlying/oracledb/rector/ServicioUtilities/ServicioUtilities",
				OperationElementName: "listarRefCodesSol"
			}, function (operation)
				{
					operation.Envelope.Body.listarRefCodesSol.dominio.__text = "CART_POLIZAS.CAPO_TP_POLIZA";
					operation.$post(function (response)
					{
						$scope.tiposPoliza = response.valorRetorno ? [].concat(response.valorRetorno.cgRefCodes).map(function (element)
						{
							element.value = element.rvLowValue;
							element.label = element.rvMeaning;
							return element;
						}) : [];
					});
				});

			Gateway.get({
				UddiServiceRegistryName: "http://slopr03123.mercantilseguros.com:17011/underlying/oracledb/rector/serviciomonedas/ServicioMonedas",
				OperationElementName: "listarMonedasSolicitudesSol"
			}, function (operation)
				{
					operation.$post(function (response)
					{
						$scope.monedas = response.poListaMonedas ? [].concat(response.poListaMonedas.poListaMonedasItem).map(function (element)
						{
							element.value = element.stlmCamoCdMoneda;
							element.label = element.stlmDeMoneda;
							return element;
						}) : [];
					});
				});

			Gateway.get({
				UddiServiceRegistryName: "http://slopr03123.mercantilseguros.com:17011/underlying/oracledb/rector/serviciosolicitudessuscripcion/ServicioSolicitudesSuscripcion",
				OperationElementName: "listarIndolesSol"
			}, function (operation)
				{
					operation.$post(function (response)
					{
						$scope.indoles = response.poListaIndoles ? [].concat(response.poListaIndoles.polistarIndolesItem).map(function (element)
						{
							element.value = element.stliCdIndole;
							element.label = element.stliDeIndole;
							return element;
						}) : [];
					});
				});

			Gateway.get({
				UddiServiceRegistryName: "http://slopr03123.mercantilseguros.com:17011/underlying/oracledb/rector/ServicioUtilities/ServicioUtilities",
				OperationElementName: "listarRefCodesSol"
			}, function (operation)
				{
					operation.Envelope.Body.listarRefCodesSol.dominio.__text = "NACIONALIDAD";
					operation.Envelope.Body.listarRefCodesSol.lowValue.__text = "'V','E','J'";
					operation.$post(function (response)
					{
						$scope.nacionalidades = response.valorRetorno ? [].concat(response.valorRetorno.cgRefCodes).map(function (element)
						{
							element.value = element.rvLowValue;
							element.label = element.rvMeaning;
							return element;
						}) : [];
					});
				});

			Gateway.get({
				UddiServiceRegistryName: "http://slopr03123.mercantilseguros.com:17011/underlying/oracledb/rector/ServicioUtilities/ServicioUtilities",
				OperationElementName: "listarCodigoAreaSol"
			}, function (operation)
				{
					operation.Envelope.Body.listarCodigoAreaSol.cacgInCelular.__text = "N";
					operation.$post(function (response)
					{
						$scope.codigosArea = response.valorRetorno ? [].concat(response.valorRetorno.cartCodigoArea).map(function (element)
						{
							element.value = element.cacgCdCodigoArea;
							element.label = element.cacgCdCodigoArea;
							return element;
						}) : [];
					});
				});

			Gateway.get({
				UddiServiceRegistryName: "http://slopr03123.mercantilseguros.com:17011/underlying/oracledb/rector/ServicioUtilities/ServicioUtilities",
				OperationElementName: "listarCodigoAreaSol"
			}, function (operation)
				{
					operation.Envelope.Body.listarCodigoAreaSol.cacgInCelular.__text = "S";
					operation.$post(function (response)
					{
						$scope.codigosCelular = response.valorRetorno ? [].concat(response.valorRetorno.cartCodigoArea).map(function (element)
						{
							element.value = element.cacgCdCodigoArea;
							element.label = element.cacgCdCodigoArea;
							return element;
						}) : [];
					});
				});

			$scope.$watchGroup(['generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdLineNegocio.__text', 'generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnTpPoliza.__text'], function ()
			{
				if ($scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdLineNegocio.__text && $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnTpPoliza.__text)
				{
					Gateway.get({
						UddiServiceRegistryName: "http://slopr03123.mercantilseguros.com:17011/underlying/oracledb/rector/servicioramos/ServicioRamos",
						OperationElementName: "listarRamosSolicitudesSol"
					}, function (operation)
						{
							operation.Envelope.Body.listarRamosSolicitudesSol.lineaNegocio.__text = $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdLineNegocio.__text;
							operation.Envelope.Body.listarRamosSolicitudesSol.tpPoliza.__text = $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnTpPoliza.__text;

							Gateway.post(operation, function (response)
							{
								$scope.ramos = response.poListaRamos ? [].concat(response.poListaRamos.poListaRamosItem).map(function (element)
								{
									element.value = element.stlrCarpCdRamo;
									element.label = element.stlrDeRamo;
									return element;
								}) : [];
							});
						});
				} else
				{
					$scope.ramos = [];
				}
			});

			$scope.$watchGroup(['generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdLineNegocio.__text', 'generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnTpPoliza.__text', 'generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCapuCarpCdRamo.__text'], function ()
			{
				if ($scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdLineNegocio.__text && $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnTpPoliza.__text && $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCapuCarpCdRamo.__text)
				{
					Gateway.get({
						UddiServiceRegistryName: "http://slopr03123.mercantilseguros.com:17011/underlying/oracledb/rector/servicioproductos/ServicioProductos",
						OperationElementName: "listarProductosSolicitudesSol"
					}, function (operation)
						{
							operation.Envelope.Body.listarProductosSolicitudesSol.lineaNegocio.__text = $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdLineNegocio.__text;
							operation.Envelope.Body.listarProductosSolicitudesSol.tpPoliza.__text = $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnTpPoliza.__text;
							operation.Envelope.Body.listarProductosSolicitudesSol.cdRamo.__text = $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCapuCarpCdRamo.__text;
							operation.Envelope.Body.listarProductosSolicitudesSol.cdFuncionalidad.__text = "GSS";

							Gateway.post(operation, function (response)
							{
								$scope.productos = response.poListaProductos ? [].concat(response.poListaProductos.poListaProductosItem).map(function (element)
								{
									element.value = element.stlpCapuCdProducto;
									element.label = element.stlpDeProducto;
									return element;
								}) : [];
							});
						});
				} else
				{
					$scope.productos = [];
				}
			});

			$scope.$watchGroup(['generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdLineNegocio.__text', 'generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnTpPoliza.__text', 'generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCapuCarpCdRamo.__text', 'generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdProducto.__text',], function ()
			{
				if ($scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdLineNegocio.__text && $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnTpPoliza.__text && $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCapuCarpCdRamo.__text && $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdProducto.__text)
				{
					Gateway.get({
						UddiServiceRegistryName: "http://slopr03123.mercantilseguros.com:17011/underlying/oracledb/rector/serviciosolicitudessuscripcion/ServicioSolicitudesSuscripcion",
						OperationElementName: "listarTiposSolicitudesSol"
					}, function (operation)
						{
							operation.Envelope.Body.listarTiposSolicitudesSol.lineaNegocio.__text = $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdLineNegocio.__text;
							operation.Envelope.Body.listarTiposSolicitudesSol.tpPoliza.__text = $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnTpPoliza.__text;
							operation.Envelope.Body.listarTiposSolicitudesSol.cdRamo.__text = $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCapuCarpCdRamo.__text;
							operation.Envelope.Body.listarTiposSolicitudesSol.cdProducto.__text = $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdProducto.__text;
							operation.Envelope.Body.listarTiposSolicitudesSol.cdFuncionalidad.__text = "GSS";

							Gateway.post(operation, function (response)
							{
								$scope.tiposSolicitud = response.poListaTiposSolicitudes ? [].concat(response.poListaTiposSolicitudes.poListaTiposSolicitudesItem).map(function (element)
								{
									element.value = element.sttsTpSolicitud;
									element.label = element.sttsDeTpSolicitud;
									return element;
								}) : [];
							});
						});
				} else
				{
					$scope.tiposSolicitud = [];
				}
			});

			$scope.$watchGroup(['generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdLineNegocio.__text', 'generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnTpPoliza.__text', 'generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCapuCarpCdRamo.__text', 'generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdProducto.__text', 'generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnTpSolicitud.__text',], function ()
			{
				if ($scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdLineNegocio.__text && $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnTpPoliza.__text && $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCapuCarpCdRamo.__text && $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdProducto.__text && $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnTpSolicitud.__text)
				{
					Gateway.get({
						UddiServiceRegistryName: "http://slopr03123.mercantilseguros.com:17011/underlying/oracledb/rector/serviciosolicitudessuscripcion/ServicioSolicitudesSuscripcion",
						OperationElementName: "listarTiposMovimientosSol"
					}, function (operation)
						{
							operation.Envelope.Body.listarTiposMovimientosSol.lineaNegocio.__text = $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdLineNegocio.__text;
							operation.Envelope.Body.listarTiposMovimientosSol.tpPoliza.__text = $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnTpPoliza.__text;
							operation.Envelope.Body.listarTiposMovimientosSol.cdRamo.__text = $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCapuCarpCdRamo.__text;
							operation.Envelope.Body.listarTiposMovimientosSol.cdProducto.__text = $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnCdProducto.__text;
							operation.Envelope.Body.listarTiposMovimientosSol.tpSolicitud.__text = $scope.generarSolicitud.Envelope.Body.generarSolicitudSol.objetoSolicitud.solnTpSolicitud.__text;
							operation.Envelope.Body.listarTiposMovimientosSol.cdFuncionalidad.__text = "GSS";

							Gateway.post(operation, function (response)
							{
								$scope.movimientos = response.poListaTiposMovimientos ? [].concat(response.poListaTiposMovimientos.poListaTiposMovimientosItem).map(function (element)
								{
									element.value = element.sttsTpSolicitud;
									element.label = element.sttsDeTpSolicitud;
									return element;
								}) : [];
							});
						});
				} else
				{
					$scope.movimientos = [];
				}
			});

			$scope.generarSolicitudFunction = function ()
			{
				Gateway.post($scope.generarSolicitud, function (response)
				{
					window.location.href = window.location.href.replace(window.location.pathname.split("/")[2], "002_cot_recaudos.html");
				});
			}
		});
});
