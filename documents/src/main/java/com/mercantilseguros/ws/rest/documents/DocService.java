package com.mercantilseguros.ws.rest.documents;

import java.io.ByteArrayOutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;

import javax.xml.soap.*;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.json.JSONException;
import org.json.XML;

import com.sun.xml.internal.messaging.saaj.SOAPExceptionImpl;

@Path("doc/{id}")
public class DocService {

	@Context
	private HttpServletRequest servletRequest;
	
	@GET
	@Produces({ MediaType.APPLICATION_JSON })
    public Response getDocs(@PathParam("id") String id) throws JSONException {
    	try
    	{
            SOAPConnectionFactory soapConnectionFactory = SOAPConnectionFactory.newInstance();
            SOAPConnection soapConnection = soapConnectionFactory.createConnection();

            SOAPMessage soapResponse = soapConnection.call(createBuscarDocumentoServiceSOAPRequest(id), "http://10.0.151.92:16200/BuscarDocumento/BuscarDocumentoService");
            
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            soapResponse.writeTo(out);
			
	    	return Response.ok(XML.toJSONObject(cleanJSON(new String(out.toByteArray(), "UTF-8"))).toString()).build();
    	}
    	catch(SOAPExceptionImpl ex)
    	{
    		return Response.serverError().status(Status.NOT_FOUND).build();
    	}
    	catch(Exception ex)
    	{
    		return Response.serverError().build();
    	}
    }
	
	private SOAPMessage createBuscarDocumentoServiceSOAPRequest(String id) throws Exception 
	{
		try
		{
	        MessageFactory messageFactory = MessageFactory.newInstance();
	        SOAPMessage soapMessage = messageFactory.createMessage();
	        SOAPPart soapPart = soapMessage.getSOAPPart();
	
	        // SOAP Envelope
	        SOAPEnvelope envelope = soapPart.getEnvelope();
	        envelope.addNamespaceDeclaration("bus", "http://buscarDocumento/");
	
	        // SOAP Body
	        SOAPBody soapBody = envelope.getBody();
	        SOAPElement buscarDocumento = soapBody.addChildElement("buscarDocumento", "bus");
	        SOAPElement request = buscarDocumento.addChildElement("request");
	        SOAPElement listaParametros = request.addChildElement("listaParametros");
	        SOAPElement seguridad = request.addChildElement("seguridad");
	        
	        SOAPElement nombre = listaParametros.addChildElement("nombre");nombre.addTextNode("dID");
	        SOAPElement operadorFechaNumerico = listaParametros.addChildElement("operadorFechaNumerico");operadorFechaNumerico.addTextNode("=");
	        SOAPElement valor = listaParametros.addChildElement("valor");valor.addTextNode(id);
	        
	        SOAPElement usuario = seguridad.addChildElement("usuario");usuario.addTextNode("ms_usr_rector");
	        SOAPElement password = seguridad.addChildElement("password");password.addTextNode("welcome1");
	
	        soapMessage.saveChanges();
	        
	        soapMessage.writeTo(System.out);
	
	        return soapMessage;
		}
		catch(Exception ex)
		{
			throw ex;
		}
    }
	
	private String cleanJSON(String input)
	{
		return input.replaceAll("(<\\s*\\/?)\\s*(\\w+):(\\w+)", "$1$3").replace("soapenv:", "").replace("soap-env:", "").replace("ser:", "").replace("ns0:", "");
	}
}
