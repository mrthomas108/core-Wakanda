/**
 * 
 */
package org.wakanda.qa.test.rest.ds.domain;

import org.wakanda.qa.commons.server.rest.domain.BasicEntity;

import com.google.gson.annotations.SerializedName;

/**
 * @author ouissam.gouni@4d.com
 * 
 */
public class KeyUuid extends BasicEntity {
	
	@SerializedName("ID_uuid")
	private String idUuid;

	@SerializedName("as_string")
	private String aSString;

	@SerializedName("as_number")
	private Double aSNumber;

	@SerializedName("ar_master3")
	private Master3 aRMaster3;

	public KeyUuid(String key) {
		super(key);
	}
	
	public String getIdUuid() {
		return idUuid;
	}

	public void setIdUuid(String idUuid) {
		this.idUuid = idUuid;
	}

	public String getASString() {
		return aSString;
	}

	public void setASString(String aSString) {
		this.aSString = aSString;
	}


	public Double getASNumber() {
		return aSNumber;
	}

	public void setASNumber(Double aSNumber) {
		this.aSNumber = aSNumber;
	}


	public Master3 getARMaster3() {
		return aRMaster3;
	}

	public void setARMaster3(Master3 aRMaster3) {
		this.aRMaster3 = aRMaster3;
	}


	@Override
	public boolean equals(Object obj) {
		boolean b = super.equals(obj);
		if (obj instanceof KeyUuid) {
			KeyUuid vs = (KeyUuid) obj;
			
			b = b && (getIdUuid() == null ? vs.getIdUuid() == null
					: getIdUuid().equals(vs.getIdUuid()));

			b = b && (getASString() == null ? vs.getASString() == null
							: getASString().equals(vs.getASString()));
			
			b = b && (getASNumber() == null ? vs.getASNumber() == null
					: getASNumber().equals(vs.getASNumber()));
			
			b = b && (getARMaster3() == null ? vs.getARMaster3() == null
					: getARMaster3().equals(vs.getARMaster3()));

		}
		return b;

	}
}
