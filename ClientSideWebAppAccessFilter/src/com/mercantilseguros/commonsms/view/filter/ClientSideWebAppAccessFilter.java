package com.mercantilseguros.commonsms.view.filter;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.json.JSONObject;

import com.mercantilseguros.commonsms.domain.UsuarioAplicacion;
import com.mercantilseguros.commonsms.util.CommonsApplication;

public class ClientSideWebAppAccessFilter implements Filter
{
	public void init(FilterConfig arg0) throws ServletException {}
	
	public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain) throws IOException, ServletException 
	{
		HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) resp;
        
        HttpSession session = request.getSession(false); //  
        
        if(session != null)
        {        
	        response.addHeader("AuthToken", session.getId());
			response.addCookie(new Cookie("AuthToken", session.getId()));
			
	        response.addHeader("contextoGlobal", new JSONObject(CommonsApplication.getContextoGlobal()).toString());
			response.addCookie(new Cookie("contextoGlobal", new JSONObject(CommonsApplication.getContextoGlobal()).toString()));
	        
			UsuarioAplicacion usuario = (UsuarioAplicacion)session.getAttribute(CommonsApplication.USUARIO_APP);
			
			if(usuario != null)
			{
		        response.addHeader("usuario", new JSONObject(usuario).toString());
				response.addCookie(new Cookie("usuario", new JSONObject(usuario).toString()));
			}
        }
        else
        {
        	response.sendRedirect("../");
        }
        
        response.addHeader("Access-Control-Allow-Origin", "*");
		chain.doFilter(req, resp);
	}
	
	public void destroy() {}
}
