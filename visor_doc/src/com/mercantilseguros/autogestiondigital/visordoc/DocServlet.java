package com.mercantilseguros.autogestiondigital.visordoc;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.soap.MessageFactory;
import javax.xml.soap.SOAPBody;
import javax.xml.soap.SOAPConnection;
import javax.xml.soap.SOAPConnectionFactory;
import javax.xml.soap.SOAPElement;
import javax.xml.soap.SOAPEnvelope;
import javax.xml.soap.SOAPMessage;
import javax.xml.soap.SOAPPart;

import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.XML;

import com.mercantilseguros.commonsms.factory.ApplicationFactory;
import com.mercantilseguros.uddi.UddiServiceLookup;

public class DocServlet extends HttpServlet{

	public void doGet(HttpServletRequest request, HttpServletResponse response)
	throws IOException
	{
		Logger logger;
		
		try
		{
			logger = ApplicationFactory.createInstanceLogger(request.getContextPath().substring(1) + ".log", "DEBUG");
		} 
		catch (Exception e)
		{
			logger = Logger.getLogger(this.getClass());
		}

		String DOC_NOT_FOUND = request.getRequestURL().toString() + "/../../autogestiondigitalclientlibs/images/Docs/DOC_NOT_FOUND.jpg";
		String URL = DOC_NOT_FOUND;
		try
		{
			String id = request.getParameter("id");
			logger.debug(this.getClass().getName() + ": doc id: " + id);
			if(!id.equals("") && id != null)
			{
				URL = getURL(id);
			}
			else 
			{
				URL = "file:" + request.getParameter("file"); // C:\\Users\\arein\\OneDrive\\Pictures\\villa-bora-bora-3.jpg
			}
			logger.debug(this.getClass().getName() + ": doc URL: " + URL);
			String ext = URL.toLowerCase().substring(URL.lastIndexOf('.') + 1);
			if (ext.equals("pdf"))
			{
				response.setContentType("application/pdf");
			}
			else
			{
				if (ext.equals("jpg") || ext.equals("jpeg"))
				{
					response.setContentType("image/jpeg");
				}
				else
				{
					if (ext.equals("gif"))
					{
						response.setContentType("image/gif");
					}
				}
			}
			response.setHeader("Content-Disposition", "filename=\"documento." + ext + "\"");

			logger.debug(this.getClass().getName() + ": opening File!");
	        URL urlConn = new URL(URL);
	        InputStream inputStream = urlConn.openStream();
	        ServletOutputStream servletOutputStream = response.getOutputStream();
	        
	        int readBytes = 0;

			logger.debug(this.getClass().getName() + ": readingBytes!");
		    while ((readBytes = inputStream.read()) != -1) {
		  		servletOutputStream.write(readBytes);
		    }

			logger.debug(this.getClass().getName() + ": closing OutputStream!");
		    servletOutputStream.close();
	        inputStream.close();
		}
		catch (Exception e) {
			e.printStackTrace();
			logger.error(this.getClass().getName() + ": ERROR: " + e.getMessage());
			response.sendRedirect(DOC_NOT_FOUND);
		}
	}
	
	public String getURL(String id) 
	{
    	try
    	{
    		SOAPConnectionFactory soapConnectionFactory = SOAPConnectionFactory.newInstance();
            SOAPConnection soapConnection = soapConnectionFactory.createConnection();

            //UddiServiceLookup uddi = new UddiServiceLookup(UddiServiceRegistryName);
            SOAPMessage soapResponse = soapConnection.call(createBuscarDocumentoSOAPRequest(id), "http://10.0.151.92:16200/BuscarDocumento/BuscarDocumentoService");
            
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            soapResponse.writeTo(out);
			
	    	JSONObject doc = XML.toJSONObject(cleanJSON(new String(out.toByteArray(), "UTF-8")));
	    	JSONArray metadatos = doc.getJSONObject("Envelope").getJSONObject("Body").getJSONObject("buscarDocumentoResponse").getJSONObject("return").getJSONObject("listaDocumentos").getJSONArray("metadato");
	    	 
	    	for (int i = 0; i < metadatos.length(); i++) 
	    	{
                JSONObject jo = metadatos.getJSONObject(i);

                if ((jo.getString("nombre")).equals("URL")) 
                {
                	return jo.getString("valor"); 
                }
            }
	    }
    	catch(JSONException ex)
    	{
    		ex.printStackTrace();
    	}
    	catch(Exception ex)
    	{
    		ex.printStackTrace();
    	}
		return null;
    }
	
	private SOAPMessage createBuscarDocumentoSOAPRequest(String id) throws Exception 
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
