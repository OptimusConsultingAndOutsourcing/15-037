package com.mercantilseguros.autogestiondigital.cargadocumentos;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Iterator;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileItemFactory;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.fileupload.util.Streams;

import com.mercantilseguros.commonsms.domain.GlobalContext;
import com.mercantilseguros.commonsms.factory.ApplicationFactory;
import com.mercantilseguros.commonsms.util.CommonsApplication;

import org.apache.log4j.Logger;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;
import org.springframework.context.ApplicationContext;

public class UploadServlet extends HttpServlet
{
	private static final long serialVersionUID = 1L;

	// location to store file uploaded
	private static final String UPLOAD_DIRECTORY = "upload";

	// upload settings
	private static final int MEMORY_THRESHOLD = 1024 * 1024 * 3; // 3MB
	private static final int MAX_FILE_SIZE = 1024 * 1024 * 40; // 40MB
	private static final int MAX_REQUEST_SIZE = 1024 * 1024 * 50; // 50MB

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		PrintWriter writer = response.getWriter();
		Logger logger;
		
		try
		{
			logger = ApplicationFactory.createInstanceLogger(request.getContextPath().substring(1) + ".log", "DEBUG");
		} 
		catch (Exception e)
		{
			writer.println("The logger is not working");
			writer.flush();
			logger = Logger.getLogger(this.getClass());
		}

		// checks if the request actually contains upload file
		if (!ServletFileUpload.isMultipartContent(request))
		{
			response.setStatus(500);
			writer.println(this.getClass().getName() + ": Request does not contain upload data");
			writer.flush();
			logger.debug(this.getClass().getName() + ": Request does not contain upload data");
			return;
		}

		// configures upload settings
		DiskFileItemFactory factory = new DiskFileItemFactory();
		factory.setSizeThreshold(MEMORY_THRESHOLD);
		String tempDir = System.getProperty("java.io.tmpdir");
		factory.setRepository(new File(tempDir));
		logger.debug(this.getClass().getName() + ": DiskFileItemFactory -> java.io.tmpdir -> " + tempDir);

		ServletFileUpload upload = new ServletFileUpload(factory);
		upload.setFileSizeMax(MAX_FILE_SIZE);
		upload.setSizeMax(MAX_REQUEST_SIZE);
		logger.debug(this.getClass().getName() + ":" +
				" MEMORY_THRESHOLD -> " + MEMORY_THRESHOLD + 
				" / MAX_FILE_SIZE -> " + MAX_FILE_SIZE + 
				" / MAX_REQUEST_SIZE -> " + MAX_REQUEST_SIZE );

		// constructs the directory path to store upload file
		//String uploadPath = getServletContext().getRealPath("") + File.separator + UPLOAD_DIRECTORY;
		
		// creates the directory if it does not exist
//		File uploadDir = new File(uploadPath);
//		if (!uploadDir.exists())
//		{
//			uploadDir.mkdir();
//			logger.debug("[{}] upload directory = {} ", methodName, uploadDir.mkdir());
//		}
		try
		{
			// parses the request's content to extract file data
			List formItems = upload.parseRequest(request);
			Iterator iter = formItems.iterator();
			String fileDirectory = null;
			String fileName = null;
			FileItem fileItem = null;

			logger.debug(this.getClass().getName() + ": READING FIELDS.");
			// iterates over form's fields
			while (iter.hasNext())
			{
				FileItem item = (FileItem) iter.next();
				if (!item.isFormField())
				{
					fileItem = item;
				}
				else if(item.getFieldName().equals("fileDirectory"))
				{
					fileDirectory = item.getString();
				}
				else if(item.getFieldName().equals("fileName"))
				{
					fileName = item.getString();
				}
			}

			File uploadDir = new File(fileDirectory);
			if (!uploadDir.exists())
			{
				uploadDir.mkdir();
				logger.debug(this.getClass().getName() + ": BUILDING: " + fileDirectory);
			}
			String filePath = fileDirectory + fileName;

			logger.debug(this.getClass().getName() + ": WRITTING FILE TO: " + filePath);
			try
			{
				//String fileName = new File(item.getName()).getName();
				//String filePath = uploadPath + File.separator + fileName;
				File storeFile = new File(filePath);
	
				// Saves the file on disk
				fileItem.write(storeFile);
			}
			catch(Exception ex)
			{
				//response.setStatus(202);
				response.sendError(202, ex.getMessage());
				writer.println("File uploaded but there was something wrong moving it to the fileSystem!");
			} 
			
//			if(storeFile.renameTo(new File(filePath)))
//			{
//				writer.println("Upload has been done successfully!");
//			}
//			else
//			{
//				response.setStatus(202);
//				writer.println("File uploaded but there was something wrong moving it to the fileSystem!");
//			}
			// logger.debug("[{}] Upload has been done successfully! ", methodName);
		} 
		catch (Exception ex)
		{
			response.setStatus(500);
			writer.println(ex.getMessage());
			// logger.debug("[{}] There was an error: {} ", methodName, ex);
			writer.flush();
			return;
			
		}
	}
}