package com.mercantilseguros.ws.rest.documents;

import javax.annotation.Priority;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;
import javax.ws.rs.core.Response.Status;
import javax.ws.rs.ext.Provider;

@Provider
@Priority(value = 1)
public class ServiceRequestFilter implements ContainerRequestFilter
{
	@Context
	private HttpServletRequest servletRequest;

	public ServiceRequestFilter()
	{
		System.out.println("ServerRequestFilter2 initialization");
	}

	@Override
	public void filter(ContainerRequestContext requestContext)
	{
		if(requestContext.getHeaderString(HttpHeaders.AUTHORIZATION) == null || !requestContext.getHeaderString(HttpHeaders.AUTHORIZATION).equals(servletRequest.getSession().getId()))
		{
//			ResponseBuilder responseBuilder = Response.serverError();
//			Response response = responseBuilder.status(Status.UNAUTHORIZED).build();
//			requestContext.abortWith(response);
		} 
	}
}