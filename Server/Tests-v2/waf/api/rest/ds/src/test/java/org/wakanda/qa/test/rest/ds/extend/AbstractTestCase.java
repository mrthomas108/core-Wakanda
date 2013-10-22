package org.wakanda.qa.test.rest.ds.extend;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.wakanda.qa.commons.server.rest.DCUtil;
import org.wakanda.qa.commons.server.rest.DSUtil;
import org.wakanda.qa.commons.server.rest.domain.BasicEntity;
import org.wakanda.qa.commons.server.rest.domain.ResponseEntities;
import org.wakanda.qa.commons.server.settings.IConfiguration;
import org.wakanda.qa.commons.server.ut.ResponseHandler;
import org.wakanda.qa.test.rest.ds.settings.Configuration;
import org.wakanda.qa.test.rest.ds.settings.Settings;

/**
 * Abstract class that provides common test cases utilities.
 * 
 * @author ouissam.gouni@4d.com
 * 
 */
public abstract class AbstractTestCase extends
		org.wakanda.qa.commons.server.ut.AbstractTestCase {
	
	protected void check(HttpRequest request, int expectedSC,
			ResponseHandler responseHandler) throws Throwable {
		check(request, null, expectedSC, responseHandler);
	}
	
	protected void check(HttpRequest request,
			ResponseHandler responseHandler) throws Throwable {
		check(request, null, HttpStatus.SC_OK, responseHandler);
	}

	/**
	 * Asserts that two ResponseEntities objects are equals.
	 * 
	 * @param expected
	 * @param actual
	 */
	protected void assertEntitiesEquals(ResponseEntities<?> expected,
			ResponseEntities<?> actual) {
		assertEquals(expected.getEntitySet(), actual.getEntitySet());
		assertEquals(expected.getEntityModel(), actual.getEntityModel());
		assertEquals(expected.getCount(), actual.getCount());
		assertEquals(expected.getSent(), actual.getSent());
		assertEquals(expected.getFirst(), actual.getFirst());
		assertNotNull(actual.getEntities());
		assertEquals(expected.getEntities().length, actual.getEntities().length);
		assertArrayEquals(expected.getEntities(), actual.getEntities());
	}

	/**
	 * Asserts that entites returned by an http response equal the given expected entities.
	 * 
	 * @param expected
	 * @param httpResponse
	 * @throws Exception
	 */
	protected <T extends BasicEntity> void assertEntitiesEquals(
			ResponseEntities<T> expected, HttpResponse httpResponse, Class<T> entityType)
			throws Exception {
		// Get response entities and release system resources.
		DCUtil<T> dsu = DCUtil.getInstance(entityType);
		ResponseEntities<T> actual = dsu.getResponseEntities(httpResponse);
		// Check the status-code
		assertEqualsStatusCode(HttpStatus.SC_OK, httpResponse);
		// Check the response
		assertEntitiesEquals(expected, actual);
	}
	
	/**
	 * Asserts that entites returned by an http response equal the content related to the given test ressource.
	 * 
	 * @param expected
	 * @param httpResponse
	 * @throws Exception
	 */
	protected <T extends BasicEntity> void assertEntitiesEquals(
			String testResource, HttpResponse httpResponse, Class<T> entityType)
			throws Exception {
		DCUtil<T> dsu = DCUtil.getInstance(entityType);
		
		// Calculate expected repsonse
		String source = Settings.getExpectedContent(testResource);
		ResponseEntities<T> expected = dsu
				.getResponseEntities(source);
		
		// Get response entities and release system resources.
		ResponseEntities<T> actual = dsu.getResponseEntities(httpResponse);
		
		// Check the status-code
		assertEqualsStatusCode(HttpStatus.SC_OK, httpResponse);
		// Check the response
		assertEntitiesEquals(expected, actual);
	}
	
	/**
	 * @param testResource
	 * @param actual
	 * @param entityType
	 * @throws Exception
	 */
	protected <T extends BasicEntity> void assertEntityEquals(
			String testResource,  T actual, Class<T> entityType)
			throws Exception {
		String source = Settings.getExpectedContent(testResource);
		T expected = DSUtil.getGson().fromJson(source,
				entityType);
		assertEquals(expected, actual);
	}
	
	/**
	 * @param testResource
	 * @param httpResponse
	 * @param entityType
	 * @throws Exception
	 */
	protected <T extends BasicEntity> void assertEntityEquals(
			String testResource,  HttpResponse httpResponse, Class<T> entityType)
			throws Exception {
		T actual = DSUtil.fromJson(httpResponse, entityType);
		assertEntityEquals(testResource, actual, entityType);
	}
	


	@Override
	protected int getDefaultTimeout() {
		return 60000;
	}

	@Override
	protected IConfiguration getConfiguration() {
		return Configuration.getInstance();
	}

}