//
var totalTollBooths = 0;
//
async function initTollBooth() {
	totalTollBooths = await contract.totalTollBooths().call();
}
// 
function uploadFile(name, callback) {
	//var $form = $("#test");
	var urlPost = "/admin/fileupload";//$form.attr( "action" );
	var filetoupload = $('#filetoupload')[0].files[0];
	var type = filetoupload ? filetoupload.type : null;
	var matchType = ["image/png", "image/jpg", "image/jpeg"];
	if(!filetoupload || matchType.indexOf(type) == -1 || filetoupload.size > 104857600){//104857600Byte = 1M
		if(typeof callback === 'function')callback();
		return;
	}
	var formData = false;
    if(window.FormData){
        formData = new FormData();
		formData.append("file", filetoupload);
    } else{
		if(typeof callback === 'function')callback();
		return;
	}
	//
	//$('#waiting2').show();
	$.ajax({
		url : urlPost+"/"+name,
		type : 'POST',
		data : formData,
		cache: false,
		processData: false,  // tell jQuery not to process the data
		contentType: false,  // tell jQuery not to set contentType
		success : function(data) {
		    //console.log(data);
			//$('#waiting2').hide();
			if(typeof callback === 'function')callback();
		},
		error: function(e){//alert("error:"+e);
			//$('#waiting2').hide();
			if(typeof callback === 'function')callback();
		}
	});
};



$("#admin-add-toll-booth").submit(function( event ) {
	// Stop form from submitting normally
	event.preventDefault();
	var forPosst = false;
	// Get some values from elements on the page:
	var $form = $(this);
	var urlPost = $form.attr( "action" );
	if(!urlPost)return;
	//
	var name = $form.find( "input[name='name']" ).val().trim();
	var location = $form.find( "input[name='location']" ).val().trim();
	var description = $form.find( "input[name='description']" ).val().trim();
	var investment = $form.find( "input[name='investment']" ).val().trim();
	var startTime = $form.find( "input[name='startTime']" ).val().trim();
	var operatorUnit = $form.find( "input[name='operatorUnit']" ).val().trim();
	var taxCode = $form.find( "input[name='taxCode']" ).val().trim();
	var activate = $form.find( "input[name='activate']" ).prop("checked");
	//var filetoupload = $form.find( "input[name='filetoupload']" ).val();
	//alert(name);alert(location);alert(description);alert(investment);alert(startTime);alert(operatorUnit);alert(taxCode);alert(activate);
	//
	if(name && location && description && investment && startTime && operatorUnit && taxCode){
		forPosst = true;
		investment = tronWeb.toSun(investment);
	}
	//
	if(!forPosst)return;
	$('#waiting2').show();
	// Send the data using post
	contract.createNewTollBooth(name, location, description, investment, startTime, operatorUnit, taxCode, activate).send().then(function(r) {
		uploadFile(totalTollBooths, function(rs){
			window.location.href = "index.html";
		});
	    console.log("createNewTollBooth: "+r);
	}).catch(function(e) {
		$('#waiting2').hide();
	    console.log("createNewTollBooth: "+e);
	});
});



