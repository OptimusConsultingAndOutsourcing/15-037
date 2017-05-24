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
		
		String methodName = "doPost";

		// logger.debug("[{}] call", methodName);

		// checks if the request actually contains upload file
		if (!ServletFileUpload.isMultipartContent(request))
		{
			response.setStatus(500);
			writer.println("Request does not contain upload data");
			// logger.debug("[{}] Request does not contain upload data", methodName);
			writer.flush();
			return;
		}

		// configures upload settings
		DiskFileItemFactory factory = new DiskFileItemFactory();
		factory.setSizeThreshold(MEMORY_THRESHOLD);
		factory.setRepository(new File(System.getProperty("java.io.tmpdir")));
		// logger.debug("[{}] factory= {} ", methodName, factory);

		ServletFileUpload upload = new ServletFileUpload(factory);
		upload.setFileSizeMax(MAX_FILE_SIZE);
		upload.setSizeMax(MAX_REQUEST_SIZE);
		// logger.debug("[{}] upload= {} ", methodName, upload);

		// constructs the directory path to store upload file
		String uploadPath = getServletContext().getRealPath("") + File.separator + UPLOAD_DIRECTORY;
		
		// creates the directory if it does not exist
		File uploadDir = new File(uploadPath);
		if (!uploadDir.exists())
		{
			uploadDir.mkdir();
			// logger.debug("[{}] upload directory = {} ", methodName, uploadDir.mkdir());
		}
		try
		{
			// parses the request's content to extract file data
			List formItems = upload.parseRequest(request);
			Iterator iter = formItems.iterator();
			String fileSystem = null;
			File storeFile = null;
			String fileName = null;

			// iterates over form's fields
			while (iter.hasNext())
			{
				FileItem item = (FileItem) iter.next();
				if (!item.isFormField())
				{
					fileName = new File(item.getName()).getName();
					String filePath = uploadPath + File.separator + fileName;
					storeFile = new File(filePath);

					// saves the file on disk
					item.write(storeFile);
				}
				else if(item.getFieldName().equals("poDeRuta"))
				{
					fileSystem = item.getString();
				}
			}
			
			if(storeFile.renameTo(new File(fileSystem + fileName)))
			{
				writer.println("Upload has been done successfully!");
			}
			else
			{
				response.setStatus(202);
				writer.println("File uploaded but there was something wrong moving it to the fileSystem!");
			}
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