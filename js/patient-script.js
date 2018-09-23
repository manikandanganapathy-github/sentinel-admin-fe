var modePatient, patientData;
$(document).ready(function () {

	function excelToJSON(oEvent) {
		// Get The File From The Input
		var oFile = oEvent.files[0],
			sFilename = oFile.name,
			// Create A File Reader HTML5
			reader = new FileReader();

		// Ready The Event For When A File Gets Selected
		reader.onload = function (e) {
			var data = e.target.result,
				cfb = XLS.CFB.read(data, {
					type: 'binary'
				});
			var wb = XLS.parse_xlscfb(cfb);
			// Loop Over Each Sheet
			wb.SheetNames.forEach(function (sheetName) {
				// Obtain The Current Row As CSV

				var oJS = XLS.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);
				if (oJS.length > 1) {
                    exlJSONData= JSON.stringify(oJS);
                    postMethodJq("saveMultiplePatients",{exlJSONData});
					loadPatientData(oJS, 0);
				} else {
					alert("No records found.");
				}
			});
		};

		// Tell JS To Start Reading The File.. You could delay this if desired
		reader.readAsBinaryString(oFile);
	}

	$(document).on('change', '#patientBrowseBtn', function () {
		var uploadFile = document.getElementById("patientBrowseBtn").value,
			filename = uploadFile.substring(uploadFile.lastIndexOf('\\') + 1);
		document.getElementById('patientFileUpBox').value = filename;
		if (filename != "") {
			$('#patientUploadBtn').prop('disabled', false);
		}
	});

	$(document).on('click', '#patientUploadBtn', function () {
		var uFileIn = document.getElementById("patientBrowseBtn");
		excelToJSON(uFileIn);
		$('#patientFileUpBox').val("");
		$('#patientUploadBtn').prop('disabled', true);
	});

	$(document).on('click', '#patientNewBtn', function () {
		$('#modalBody').text('');
		modePatient = "New";
		$('#patientIDVal').val("").prop('disabled', false);
		$('.inputField').val("");
		getMethodJq('getSysDate');
		$('#newPatient').show();
		$('#modalTitle').text('New Patient Information');
		$('#modalBody').append($('#newPatient'));
		$('.modal-footer').hide();
		$("#commonPatientModal").modal('show');
	});

	$(document).on('click', '#saveNewPatient', function () {
		$("#commonPatientModal").modal('hide');
		if (modePatient == "New") {
			var newPatientRecord = {},
				newPatientRecordArr = [];
			newPatientRecord.PatientID = $("#patientIDVal").val();
			newPatientRecord.CreatedDate = $("#createDateVal").val();
			newPatientRecord.FirstName = $("#firstNameVal").val();
			newPatientRecord.LastName = $("#lastNameVal").val();
			newPatientRecord.DOB = $("#dobVal").val();
			newPatientRecord.Gender = $("#genderVal").val();
			newPatientRecord.PhoneID = $("#phoneNoVal").val();
			newPatientRecord.Select = "true";
			newPatientRecordArr.push(newPatientRecord);
			postMethodJq("saveNewPatient", newPatientRecord);
			loadPatientData(newPatientRecordArr, 0);
		}
		if (modePatient == "Edit") {
			for (var i = 0; i < patientData.length; i++) {
				if (patientData[i].PatientID == $("#patientIDVal").val()) {
					patientData[i].PatientID = $("#patientIDVal").val();
					var tempCD = new Date($("#createDateVal").val());
					patientData[i].CreatedDate = tempCD.toLocaleDateString();
					patientData[i].FirstName = $("#firstNameVal").val();
					patientData[i].LastName = $("#lastNameVal").val();
					patientData[i].DOB = $("#dobVal").val();
					patientData[i].Gender = $("#genderVal").val();
					patientData[i].PhoneID = $("#phoneNoVal").val();
					patientData[i].Select = "true";
					var tempEditData = patientData[i];
					postMethodJq("updatePatient", tempEditData);
				}
			}
			loadPatientData(patientData, 1);
		}
		$('#newPatient').hide();
	});

	$(document).on('click', '#editPatient', function () {
		modePatient = "Edit";
		var $row = jQuery(this).closest('tr'),
			$columns = $row.find('td'),
			values = "";
		$columns.addClass('row-highlight');
		jQuery.each($columns, function (i, item) {
			values = item.innerHTML;
			switch (i) {
				case 0:
					$('#patientIDVal').val(values).prop('disabled', true);
					break;
				case 1:
					$('#createDateVal').val(values).prop('disabled', true);
					break;
				case 2:
					$('#firstNameVal').val(values);
					break;
				case 3:
					$('#lastNameVal').val(values);
					break;
				case 4:
					$('#dobVal').val(values);
					break;
				case 5:
					$('#genderVal').val(values);
					break;
				case 6:
					$('#phoneNoVal').val(values);
					break;
				default:
					$('#newPatient').show();
			}
		});
		$('#modalTitle').text('Edit Patient Information');
		$('#modalBody').append($('#newPatient'));
		$('.modal-footer').hide();
		$("#commonPatientModal").modal('show');
	});
	var $rowPatientTable, $columnsPatientTable,
		modalConfirm = function (callback) {

			$(document).on('click', '#deletePatient', function () {
				$('#modalBody').text('');
				$rowPatientTable = jQuery(this).closest('tr');
				$columnsPatientTable = $rowPatientTable.find('td');
				$('#newPatient').hide();
				$('#modalTitle').text('Confirmation');
				$('#modalBody').text('Are you sure want to delete this patient?');
				$('.modal-footer').show();
				$("#commonPatientModal").modal('show');
			});

			$("#modalYes").on("click", function () {
				callback(true);
				$columnsPatientTable.addClass('row-highlight').remove();
				var deletePatient = {};
				deletePatient.PatientID = $columnsPatientTable[0].textContent;
				postMethodJq('deletePatient', deletePatient);
				$("#commonPatientModal").modal('hide');
			});

			$("#modalNo").on("click", function () {
				callback(false);
				$("#commonPatientModal").modal('hide');
			});
		};

	modalConfirm(function (confirm) {
		if (confirm) {
			$('#toastMessage').text("Patient deleted successfully.");
			var x = document.getElementById("toastMessage");
			x.className = "show";
			setTimeout(function () {
				x.className = x.className.replace("show", "");
			}, 1500);
		} else {

		}
	});
	$("#patientSearchBox").on("keyup", function () {
		var value = $(this).val().toLowerCase();
		$("#patientTableDataBody tr").filter(function () {
			$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
		});
	});
});

function loadPatientData(dummyDataRef, rmTrFlag) {
	if (rmTrFlag == 1) {
		$('#patientTableDataBody tr').remove();
	} else if (rmTrFlag == 0) {
		var c = patientData.concat(dummyDataRef);
		patientData = c;
	}
	var tr;
	for (var i = 0; i < dummyDataRef.length; i++) {
		if (dummyDataRef[i].Select.toLowerCase() == "true") {
			tr = $('<tr/>');
			var tempCD = new Date(dummyDataRef[i].CreatedDate);
			tr.append("<td>" + dummyDataRef[i].PatientID + "</td>");
			tr.append("<td>" + tempCD.toLocaleDateString() + "</td>");
			tr.append("<td>" + dummyDataRef[i].FirstName + "</td>");
			tr.append("<td>" + dummyDataRef[i].LastName + "</td>");
			tr.append("<td>" + dummyDataRef[i].DOB + "</td>");
			tr.append("<td>" + dummyDataRef[i].Gender + "</td>");
			tr.append("<td>" + dummyDataRef[i].PhoneID + "</td>");
			tr.append('<td><a href="javascript:void(0);" id="editPatient">Edit</a> / <a href="javascript:void(0);" id="deletePatient">Delete</a></td>');
		}
		$('#patientTableDataBody').append(tr);
	}
}

function getMethodJq(funcName) {
	$.ajax({
		url: 'http://localhost:3000/patient/' + funcName,
		success: function (data) {
			if (funcName == "getAllPatients") {
				patientData = data;
				if(data.length>=1){
					loadPatientData(patientData, 1);
					$('#patientTableData').DataTable();	
				}else{
					$('#patientTableDataBody').append("<tr><td colspan='8'><center>No data available</center></td></tr>");
				}		
			}
			if (funcName == "getSysDate") {
				$("#createDateVal").val(data.sysCurrDate).prop('disabled', true);
			}
		}
	});
}

function postMethodJq(funcName, reqData) {
	$.ajax({
		url: 'http://localhost:3000/patient/' + funcName,
		type: 'POST',
		data: reqData,
		success: function (data) {
            console.log("success");
        }
	});
}

getMethodJq("getAllPatients");