package com.mercantilseguros.soapgateway.ws.rest;

import com.sun.jersey.spi.container.ContainerResponseFilter;
import com.sun.jersey.spi.container.ContainerRequest;
import com.sun.jersey.spi.container.ContainerResponse;

import javax.ws.rs.ext.Provider;

@Provider
public class CORSFilter implements ContainerResponseFilter {

	@Override
	public ContainerResponse filter(ContainerRequest request, ContainerResponse response)
	{
		response.getHttpHeaders().add("Access-Control-Allow-Origin", "*");
		response.getHttpHeaders().add("Access-Control-Allow-Headers", "origin, content-type, accept, authorization");
		response.getHttpHeaders().add("Access-Control-Allow-Credentials", "true");
		response.getHttpHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD");
		response.getHttpHeaders().add("Access-Control-Max-Age", "1209600");
		return response;
	}

}