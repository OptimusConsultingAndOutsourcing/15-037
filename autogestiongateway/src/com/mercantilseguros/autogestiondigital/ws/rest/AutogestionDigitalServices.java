package com.mercantilseguros.autogestiondigital.ws.rest;

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

import com.mercantilseguros.uddi.UddiServiceLookup;

@Path("soapresponse")
public class AutogestionDigitalServices extends javax.ws.rs.core.Application	 {
	
	//final static Logger logger = Logger.getLogger(AutogestionDigitalServices.class);

	@Path("/get")
	@POST
	@Produces({ MediaType.TEXT_XML })
	public Response get(@FormParam("SOAPRequestMessage") String SOAPRequestMessage, @FormParam("UddiServiceRegistryName") String UddiServiceRegistryName) {
    	try 
    	{    
    		//logger.debug("Sign in autogestiondigital");
    		// GET & LOG SOAPRequestMessage
    		MimeHeaders header = new MimeHeaders();		
    		header.addHeader("Content-Type", "text/xml");
    		SOAPMessage soapRequestMessage = MessageFactory.newInstance().createMessage(header, new ByteArrayInputStream(SOAPRequestMessage.getBytes()));
    		System.out.println("*** " + UddiServiceRegistryName + ": SOAP REQUEST MESSAGE ***");
	        soapRequestMessage.writeTo(System.out);
	        System.out.println();
	        
	        // SOAP Connection
	        String endPoint = "";
			try
			{
				UddiServiceLookup uddi = new UddiServiceLookup(UddiServiceRegistryName);
				endPoint = uddi.getEndpointUrl();
			}
			catch(Exception ex)
			{
				endPoint = UddiServiceRegistryName;
			}
			SOAPMessage soapResponse = SOAPConnectionFactory.newInstance().createConnection().call(soapRequestMessage, endPoint);
            
            // GET & SEND Response
	        ByteArrayOutputStream out = new ByteArrayOutputStream();
            soapResponse.writeTo(out);
            return Response.ok(new String(out.toByteArray(), "UTF-8")).build();
    	}
    	catch(Exception ex)
    	{
//    		logger.error(ex.getMessage());
//    		logger.error(ex.getStackTrace());
    		return Response.serverError().entity(ex.getMessage()).build();
    	}
    }
	
	@Override
    public Set<Class<?>> getClasses() {
        Set<Class<?>> s = new HashSet<Class<?>>();
        s.add(AutogestionDigitalServices.class);
        return s;
    }
}