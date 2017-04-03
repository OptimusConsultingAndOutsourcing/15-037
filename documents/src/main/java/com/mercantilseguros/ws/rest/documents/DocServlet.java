package com.mercantilseguros.ws.rest.documents;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.net.URI;
import java.net.URL;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class DocServlet extends HttpServlet{

	public void doGet(HttpServletRequest request, HttpServletResponse response)
	throws IOException{
		
		//String imageUrlString = "http://slopr92.seguros.mercantilsf.com:16200/cs/groups/ms_publico/documents/siniestro/zxzf/mji3/~edisp/dev_227005.pdf";
        String imageUrlString = "http://i.imgur.com/3lQAD2E.jpg";
        
        //response.setContentType("application/pdf");
        response.setContentType("image/jpeg");
		response.setHeader("Content-Disposition", "filename=\"hoge.txt\"");

        URL urlConn = new URL(imageUrlString);
        InputStream inputStream = urlConn.openStream();
        ServletOutputStream servletOutputStream = response.getOutputStream();
        
        int readBytes = 0;
        
	    while ((readBytes = inputStream.read()) != -1) {
	  		servletOutputStream.write(readBytes);
	    }

	    servletOutputStream.close();
        inputStream.close();
	}
}
