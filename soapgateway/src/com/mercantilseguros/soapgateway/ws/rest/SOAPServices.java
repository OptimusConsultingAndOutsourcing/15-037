package com.mercantilseguros.soapgateway.ws.rest;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.HashSet;
import java.util.Set;

import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.xml.soap.MessageFactory;
import javax.xml.soap.MimeHeaders;
import javax.xml.soap.SOAPConnectionFactory;
import javax.xml.soap.SOAPMessage;

import org.apache.log4j.Logger;

import com.mercantilseguros.commonsms.factory.ApplicationFactory;
import com.mercantilseguros.commonsms.util.CommonsApplication;
import com.mercantilseguros.uddi.UddiServiceLookup;

@Path("soap")
public class SOAPServices extends javax.ws.rs.core.Application	 {
	
	//final static Logger logger = Logger.getLogger(AutogestionDigitalServices.class);

	@Path("/post")
	@POST
	@Produces({ MediaType.TEXT_XML })
	public Response post(@FormParam("SOAPRequestMessage") String SOAPRequestMessage, @FormParam("UddiServiceRegistryName") String UddiServiceRegistryName) {
    	try 
    	{   
    		// Encoding the SOAPRequestMessage to UTF-8
    		SOAPRequestMessage = new String(SOAPRequestMessage.getBytes(), "UTF-8");
    		
    		// Uncomment to MOCK UP Response
    		//Response.ok("ASDASDASD").build();
    		
    		//logger.debug("Sign in autogestiondigital");
    		
    		// GET & LOG SOAPRequestMessage
    		MimeHeaders header = new MimeHeaders();		
    		header.addHeader("Content-Type", "text/xml");
    		SOAPMessage soapRequestMessage = MessageFactory.newInstance().createMessage(header, new ByteArrayInputStream(SOAPRequestMessage.getBytes()));
    		System.out.println("*** " + UddiServiceRegistryName + ": SOAP REQUEST MESSAGE ***");
	        soapRequestMessage.writeTo(System.out);
	        System.out.println();
	        
	        // SOAP Connection
	        //CommonsApplication.setContextoGlobal(ApplicationFactory.createInstanceGlobalContext("C:\\Users\\arein\\Temp\\Configuracion.properties_desarrollo"));
	        System.out.println("*** UddiServiceLookup -> UddiClient.buscarServicio -> findServices -> " + UddiServiceRegistryName);
			UddiServiceLookup uddi = new UddiServiceLookup(UddiServiceRegistryName);
			System.out.println("*** call: " + uddi.getEndpointUrl());
			SOAPMessage soapResponse = SOAPConnectionFactory.newInstance().createConnection().call(soapRequestMessage, uddi.getEndpointUrl());
            
            // GET, Encoding & SEND Response
	        ByteArrayOutputStream out = new ByteArrayOutputStream();
            soapResponse.writeTo(out);
            return Response.ok(new String(out.toByteArray(), "UTF-8")).build();
    	}
    	catch(Exception ex)
    	{
//    		logger.error(ex.getMessage());
//    		logger.error(ex.getStackTrace());
    		return Response.serverError().type("text/plain").entity(ex.getMessage()).build();
    	}
    }
	
	@Override
    public Set<Class<?>> getClasses() {
        Set<Class<?>> s = new HashSet<Class<?>>();
        s.add(SOAPServices.class);
        return s;
    }
}