package com.mercantilseguros.soapgateway.ws.rest;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.net.URL;
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
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
//import javax.wsdl.Binding;
//import javax.wsdl.BindingInput;
//import javax.wsdl.BindingOperation;
//import javax.wsdl.Definition;
//import javax.wsdl.Message;
//import javax.wsdl.extensions.soap.SOAPBody;
//import javax.wsdl.factory.WSDLFactory;
//import javax.wsdl.xml.WSDLReader;
//import javax.xml.namespace.QName;
import javax.xml.soap.MessageFactory;
import javax.xml.soap.MimeHeaders;
import javax.xml.soap.SOAPBody;
import javax.xml.soap.SOAPConnectionFactory;
import javax.xml.soap.SOAPElement;
import javax.xml.soap.SOAPEnvelope;
import javax.xml.soap.SOAPException;
import javax.xml.soap.SOAPHeader;
import javax.xml.soap.SOAPMessage;
import javax.xml.soap.SOAPPart;
import javax.xml.soap.SOAPConstants;

import org.apache.log4j.Logger;
import org.w3c.dom.DOMException;
import org.w3c.dom.Document;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.mercantilseguros.commonsms.factory.ApplicationFactory;
import com.mercantilseguros.commonsms.util.CommonsApplication;
import com.mercantilseguros.uddi.UddiServiceLookup;
//import com.sun.xml.internal.ws.wsdl.writer.WSDLResolver;

@Path("soap")
public class SOAPServices extends javax.ws.rs.core.Application
{

	private static Logger logger;// = //
	// Logger.getLogger(AutogestionDigitalServices.class);
	
	
	// @Path("/getRequestMessage")
	// @GET
	// @Produces({ MediaType.TEXT_XML })
	// public Response getRequestMessage(@QueryParam("UddiServiceRegistryName")
	// String UddiServiceRegistryName, @QueryParam("OperationName") String
	// OperationName)
	// {
	// try
	// {
	// UddiServiceLookup uddi = new UddiServiceLookup(UddiServiceRegistryName);
	//
	// WSDLFactory factory = WSDLFactory.newInstance();
	// WSDLReader reader = factory.newWSDLReader();
	// Definition definition = reader.readWSDL(uddi.getEndpointUrl() + "?wsdl");
	// // Message:
	// name={http://xmlns.mercantilseguros.com/osb/ServicioRecaudos}consultarDocumentosRequest
	// //Message message = definition.getMessage(new
	// QName("http://xmlns.mercantilseguros.com/osb/ServicioRecaudos",
	// "consultarDocumentosRequest"));
	// //message.
	// Binding binding = definition.getBinding(new
	// QName("http://xmlns.mercantilseguros.com/osb/ServicioRecaudos",
	// "ServicioRecaudosSOAP"));
	// BindingOperation operation =
	// binding.getBindingOperation("consultarDocumentos", null, null);
	// BindingInput bi = operation.getBindingInput();
	// SOAPBody body =
	// List l = bi.getExtensibilityElements();
	//
	//// ByteArrayOutputStream out = new ByteArrayOutputStream();
	//// return Response.ok(new String(out.toByteArray(), "UTF-8")).build();
	// return Response.ok(uddi.getEndpointUrl()).build();
	// }
	// catch (Exception ex)
	// {
	// // logger.error(ex.getMessage());
	// // logger.error(ex.getStackTrace());
	// return
	// Response.serverError().type("text/plain").entity(ex.getMessage()).build();
	// }
	// }

	//@Path("/operation")
	@GET
	@Produces({ MediaType.TEXT_XML })
	public Response getOperationRequestMessage(@QueryParam("UddiServiceRegistryName") String UddiServiceRegistryName, @QueryParam("OperationElementName") String OperationElementName, @QueryParam("LogName") String LogName)
	{
		try
		{
			logger = ApplicationFactory.createInstanceLogger(LogName + ".log", "DEBUG");
//			logger.getRootLogger().getAppender("FA").ro
		} 
		catch (Exception e)
		{
			System.out.println("The logger is not working");
			logger = Logger.getLogger(this.getClass());
		}
		
		try
		{
			// GET UDDI
			String endPointUrl = "";
			if (UddiServiceRegistryName.indexOf("http://") <= -1)
			{
				logger.debug(this.getClass().getName() + ": UddiServiceLookup: " + UddiServiceRegistryName);
				UddiServiceLookup uddi = new UddiServiceLookup(UddiServiceRegistryName);
				endPointUrl = uddi.getEndpointUrl();
			}
			else
			{
				endPointUrl = UddiServiceRegistryName;
				UddiServiceRegistryName = UddiServiceRegistryName.substring(UddiServiceRegistryName.lastIndexOf("/") + 1);
			}
			logger.debug(this.getClass().getName() + ": " + UddiServiceRegistryName + ": " + OperationElementName + ": endPointUrl: " + endPointUrl);

			// SOAP Message
			MessageFactory messageFactory = MessageFactory.newInstance(SOAPConstants.SOAP_1_1_PROTOCOL);
			SOAPMessage soapMessage = messageFactory.createMessage();
			SOAPPart soapPart = soapMessage.getSOAPPart();

			// SOAP Envelope
			SOAPEnvelope envelope = soapPart.getEnvelope();

			// SOAP Header & Body
			SOAPBody soapBody = envelope.getBody();
			SOAPElement operation = null;
			SOAPElement cabeceraMsjSol = null;

			// GET ELEMENTS
			DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
			DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();

			// SOAP OPERATION
			String schemaParameter = new URL(endPointUrl).getPath();
			schemaParameter = schemaParameter.substring(0, schemaParameter.lastIndexOf(UddiServiceRegistryName)).toLowerCase().replaceAll("/", "%2F") + UddiServiceRegistryName;
			Document operationXSD = dBuilder.parse(new URL(endPointUrl + "?SCHEMA" + schemaParameter).openStream());
			operationXSD.getDocumentElement().normalize();
			String serTargetNamespace = operationXSD.getDocumentElement().getAttributes().getNamedItem("targetNamespace").getNodeValue();
			envelope.addNamespaceDeclaration("ser", serTargetNamespace);
			envelope.addNamespaceDeclaration("obj", "http://xmlns.mercantilseguros.com/osb/ObjetosComunes");
			NodeList sequenceNodes = operationXSD.getDocumentElement().getElementsByTagName("sequence");
			for (int i = 0; i < sequenceNodes.getLength(); i++)
			{
				if (sequenceNodes.item(i).getParentNode().getNodeName().equals("complexType"))
				{
					NamedNodeMap attrs = sequenceNodes.item(i).getParentNode().getAttributes();
					for (int j = 0; j < attrs.getLength(); j++)
					{
						if (attrs.getNamedItem("name") != null && attrs.getNamedItem("name").getNodeValue().equals(OperationElementName))
						{
							operation = soapBody.addChildElement(OperationElementName, "ser");
							break;
						}
					}
				}
				if (operation != null)
				{
					addElements(sequenceNodes, sequenceNodes.item(i).getChildNodes(), operation);
					break;
				}
			}

			// CabeceraMsjSol
			if (operation != null)
			{
				Document cabeceraMsjSolXSD = dBuilder.parse(new URL(endPointUrl + "?SCHEMA%2Funderlying%2Foracledb%2Frector%2Fxsdcomunes%2FCabeceraMsjSol").openStream());
				cabeceraMsjSolXSD.getDocumentElement().normalize();
				sequenceNodes = cabeceraMsjSolXSD.getDocumentElement().getElementsByTagName("sequence");
				for (int i = 0; i < sequenceNodes.getLength(); i++)
				{
					Node sequenceParentNode = sequenceNodes.item(i).getParentNode();
					if (sequenceParentNode.getNodeName().equals("complexType"))
					{
						NamedNodeMap attrs = sequenceParentNode.getAttributes();
						for (int j = 0; j < attrs.getLength(); j++)
						{
							if (attrs.getNamedItem("name") != null && attrs.getNamedItem("name").getNodeValue().equals("CabeceraMsjSol"))
							{
								cabeceraMsjSol = operation.addChildElement("cabeceraSol", "ser");
								break;
							}
						}
					}
					
					if (cabeceraMsjSol != null)
					{
						NodeList elementNodes = sequenceNodes.item(i).getChildNodes();
						for (int j = 0; j < elementNodes.getLength(); j++)
						{
							if (elementNodes.item(j).getNodeName().equals("element"))
							{
								cabeceraMsjSol.addChildElement(elementNodes.item(j).getAttributes().getNamedItem("name").getNodeValue(), "obj");
							}
						}
						break;
					}
				}
			}

			soapMessage.saveChanges();
			ByteArrayOutputStream out = new ByteArrayOutputStream();
			soapMessage.writeTo(out);
			String strMsg = new String(out.toByteArray());
			
			logger.debug(this.getClass().getName() + ": " + UddiServiceRegistryName + ": " + OperationElementName + ": SOAP REQUEST MESSAGE TEMPLATE: " + strMsg);

			return Response.ok(strMsg).build();
		} 
		catch (Exception ex)
		{
			// logger.error(ex.getMessage());
			// logger.error(ex.getStackTrace());
			return Response.serverError().type("text/plain").entity(ex.getMessage()).build();
		}
	}
	
	private void addElements(NodeList sequenceNodes, NodeList elementNodes, SOAPElement parentElement) throws DOMException, SOAPException
	{
		//NodeList elementNodes = sequenceNodes.item(i).getChildNodes();
		for (int j = 0; j < elementNodes.getLength(); j++)
		{
			if (elementNodes.item(j).getNodeName().equals("element") && !elementNodes.item(j).getAttributes().getNamedItem("name").getNodeValue().equals("cabeceraSol"))
			{
				SOAPElement element = parentElement.addChildElement(elementNodes.item(j).getAttributes().getNamedItem("name").getNodeValue(), "ser");
				String type = elementNodes.item(j).getAttributes().getNamedItem("type").getNodeValue();
				boolean isTNS = type.split(":")[0].toLowerCase().equals("tns");
				if(isTNS)
				{
					String complexType = type.split(":")[1];
					for (int k = 0; k < sequenceNodes.getLength(); k++)
					{
						if (sequenceNodes.item(k).getParentNode().getNodeName().equals("complexType") && sequenceNodes.item(k).getParentNode().getAttributes().getNamedItem("name").getNodeValue().equals(complexType))
						{
							addElements(sequenceNodes, sequenceNodes.item(k).getChildNodes(), element);
							break;
						}
					}
				}
			}
		}
	}

	//@Path("/post")
	@POST
	@Produces({ MediaType.TEXT_XML })
	public Response post(@FormParam("UddiServiceRegistryName") String UddiServiceRegistryName, @FormParam("OperationElementName") String OperationElementName, @FormParam("SOAPRequestMessage") String SOAPRequestMessage, @FormParam("LogName") String LogName)
	{
		try
		{
			logger = ApplicationFactory.createInstanceLogger(LogName + ".log", "DEBUG");
		} 
		catch (Exception e)
		{
			System.out.println("The logger is not working");
			logger = Logger.getLogger(this.getClass());
		}
		
		try
		{
			// return
			// Response.serverError().type("text/plain").entity("asdasdasd").build();

			// Encoding the SOAPRequestMessage to UTF-8
			SOAPRequestMessage = new String(SOAPRequestMessage.getBytes(), "UTF-8");

			// Uncomment to MOCK UP Response
			// Response.ok("ASDASDASD").build();

			// logger.debug("Sign in autogestiondigital");

			// GET & LOG SOAPRequestMessage
			MimeHeaders header = new MimeHeaders();
			header.addHeader("Content-Type", "text/xml");
			SOAPMessage soapRequestMessage = MessageFactory.newInstance().createMessage(header, new ByteArrayInputStream(SOAPRequestMessage.getBytes()));
			System.out.println("*** " + UddiServiceRegistryName + ": SOAP REQUEST MESSAGE ***");
			soapRequestMessage.writeTo(System.out);
			System.out.println();
			ByteArrayOutputStream soapRequestMessageOut = new ByteArrayOutputStream();
			soapRequestMessage.writeTo(soapRequestMessageOut);
			logger.debug(this.getClass().getName() + ": " + UddiServiceRegistryName + ": " + OperationElementName + ": SOAP REQUEST MESSAGE: " + new String(soapRequestMessageOut.toByteArray(), "UTF-8"));

			// SOAP Connection
			// CommonsApplication.setContextoGlobal(ApplicationFactory.createInstanceGlobalContext("C:\\Users\\arein\\Temp\\Configuracion.properties_desarrollo"));
			String endPointUrl = "";
			if (UddiServiceRegistryName.indexOf("http://") <= -1)
			{
				logger.debug(this.getClass().getName() + ": UddiServiceLookup: " + UddiServiceRegistryName);
				UddiServiceLookup uddi = new UddiServiceLookup(UddiServiceRegistryName);
				endPointUrl = uddi.getEndpointUrl();
			}
			else
			{
				endPointUrl = UddiServiceRegistryName;
				UddiServiceRegistryName = UddiServiceRegistryName.substring(UddiServiceRegistryName.lastIndexOf("/") + 1);
			}
			System.out.println("*** calling: " + endPointUrl);
			logger.debug(this.getClass().getName() + ": " + UddiServiceRegistryName + ": " + OperationElementName + ": calling: " + endPointUrl);
			SOAPMessage soapResponse = SOAPConnectionFactory.newInstance().createConnection().call(soapRequestMessage, endPointUrl);

			// GET, Encoding & SEND Response
			ByteArrayOutputStream out = new ByteArrayOutputStream();
			soapResponse.writeTo(out);
			logger.debug(this.getClass().getName() + ": " + UddiServiceRegistryName + ": " + OperationElementName + ": SOAP RESPONSE MESSAGE: " + new String(out.toByteArray(), "UTF-8"));
			return Response.ok(new String(out.toByteArray(), "UTF-8")).build();
		} 
		catch (Exception ex)
		{
			// logger.error(ex.getMessage());
			// logger.error(ex.getStackTrace());
			return Response.serverError().type("text/plain").entity(ex.getMessage()).build();
		}
	}

	@Override
	public Set<Class<?>> getClasses()
	{
		Set<Class<?>> s = new HashSet<Class<?>>();
		s.add(SOAPServices.class);
		return s;
	}
}