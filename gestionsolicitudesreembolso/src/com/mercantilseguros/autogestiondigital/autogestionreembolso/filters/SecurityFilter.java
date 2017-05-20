package com.mercantilseguros.autogestiondigital.autogestionreembolso.filters;

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

import com.mercantilseguros.commonsms.domain.Productor;
import com.mercantilseguros.commonsms.domain.UsuarioAplicacion;
import com.mercantilseguros.commonsms.util.CommonsApplication;

public class SecurityFilter implements Filter
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
	        
			UsuarioAplicacion usuario = (UsuarioAplicacion)session.getAttribute(CommonsApplication.USUARIO_APP);
			
			if(usuario != null)
			{
		        response.addHeader("CodAplicacion", usuario.getCodAplicacion());
				response.addCookie(new Cookie("CodAplicacion", usuario.getCodAplicacion()));
				
		        response.addHeader("CodUsuario", usuario.getCodUsuario());
				response.addCookie(new Cookie("CodUsuario", usuario.getCodUsuario()));
		
				Productor productor = (Productor)usuario.getDatosUsuario();
				if(productor != null)
				{
			        response.addHeader("CodProductor", String.valueOf(productor.getCodigo()));
					response.addCookie(new Cookie("CodProductor", String.valueOf(productor.getCodigo())));
				}
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
