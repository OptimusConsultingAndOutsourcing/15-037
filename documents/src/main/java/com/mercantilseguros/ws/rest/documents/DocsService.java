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

@Path("docs")
public class DocsService {
	
	@GET
	@Produces({ MediaType.APPLICATION_JSON })
	public Response getDocs(
    		@QueryParam("funcionalidad") String funcionalidad
    		, @QueryParam("aplicacion") String aplicacion
    		, @QueryParam("tpExpediente") String tpExpediente
    		, @QueryParam("cdExpediente") String cdExpediente
    		, @QueryParam("nuSolicitud") String nuSolicitud
    		, @QueryParam("valorRaiz") String valorRaiz
    		) throws JSONException {
    	try
    	{
            SOAPConnectionFactory soapConnectionFactory = SOAPConnectionFactory.newInstance();
            SOAPConnection soapConnection = soapConnectionFactory.createConnection();

            SOAPMessage soapResponse = soapConnection.call(createServicioRecaudosSOAPRequest(
            		funcionalidad, aplicacion, tpExpediente, cdExpediente, nuSolicitud, valorRaiz
            		), "http://slopr03123.mercantilseguros.com:17011/underlying/oracledb/rector/serviciorecaudos/ServicioRecaudos");
            
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
	
	private SOAPMessage createServicioRecaudosSOAPRequest(
			String funcionalidad
			, String aplicacion
			, String tpExpediente
			, String cdExpediente
			, String nuSolicitud
			, String valorRaiz
			) throws Exception 
	{
		try
		{
	        MessageFactory messageFactory = MessageFactory.newInstance();
	        SOAPMessage soapMessage = messageFactory.createMessage();
	        SOAPPart soapPart = soapMessage.getSOAPPart();
	
	        // SOAP Envelope
	        SOAPEnvelope envelope = soapPart.getEnvelope();
	        envelope.addNamespaceDeclaration("ser", "http://xmlns.mercantilseguros.com/osb/ServicioRecaudos");
	        envelope.addNamespaceDeclaration("obj", "http://xmlns.mercantilseguros.com/osb/ObjetosComunes");
	
	        // SOAP Body
	        SOAPBody soapBody = envelope.getBody();
	        SOAPElement consultarDocumentosSol = soapBody.addChildElement("consultarDocumentosSol", "ser");
	        SOAPElement cabeceraSol = consultarDocumentosSol.addChildElement("cabeceraSol", "ser");
	        SOAPElement piFuncionalidad = consultarDocumentosSol.addChildElement("piFuncionalidad", "ser");piFuncionalidad.addTextNode(funcionalidad);
	        SOAPElement piAplicacion = consultarDocumentosSol.addChildElement("piAplicacion", "ser");piAplicacion.addTextNode(aplicacion);
	        SOAPElement piTpExpediente = consultarDocumentosSol.addChildElement("piTpExpediente", "ser");piTpExpediente.addTextNode(tpExpediente);
	        SOAPElement piCdExpediente = consultarDocumentosSol.addChildElement("piCdExpediente", "ser");piCdExpediente.addTextNode(cdExpediente);
	        SOAPElement piNuSolicitud = consultarDocumentosSol.addChildElement("piNuSolicitud", "ser");piNuSolicitud.addTextNode(nuSolicitud);
	        SOAPElement piValorRaiz = consultarDocumentosSol.addChildElement("piValorRaiz", "ser");piValorRaiz.addTextNode(valorRaiz);
	        
	        // SOAP Cabecera
	        Date date = new Date();
	        SOAPElement fecha = cabeceraSol.addChildElement("fecha", "obj");fecha.addTextNode(new SimpleDateFormat("yyyy-MM-dd").format(date));
	        SOAPElement hora = cabeceraSol.addChildElement("hora", "obj");hora.addTextNode(new SimpleDateFormat("HH:mm:ss").format(date));
	        SOAPElement funcionalidadCab = cabeceraSol.addChildElement("funcionalidad", "obj");funcionalidadCab.addTextNode(funcionalidad);
	        SOAPElement aplicacionCab = cabeceraSol.addChildElement("aplicacion", "obj");aplicacionCab.addTextNode(aplicacion);
	        SOAPElement usuario = cabeceraSol.addChildElement("usuario", "obj");usuario.addTextNode("");
	        SOAPElement ip = cabeceraSol.addChildElement("ip", "obj");ip.addTextNode("");
	
	        soapMessage.saveChanges();
	        
	        //soapMessage.writeTo(System.out);
	
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
