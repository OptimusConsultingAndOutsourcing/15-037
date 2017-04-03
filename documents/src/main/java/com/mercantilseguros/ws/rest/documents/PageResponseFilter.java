package com.mercantilseguros.ws.rest.documents;

import java.io.IOException;

import javax.servlet.*;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class PageResponseFilter implements Filter
{

	public void init(FilterConfig arg0) throws ServletException {}
	
	public void doFilter(ServletRequest req, ServletResponse resp,
			FilterChain chain) throws IOException, ServletException {
		
		HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) resp;
        
        response.addHeader("AuthToken", request.getSession().getId());
		
		response.addCookie(new Cookie("AuthToken", request.getSession().getId()));

		chain.doFilter(req, resp);
			
	}
	public void destroy() {}


	

}
