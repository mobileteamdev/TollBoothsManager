//
var tollBoothId = null;
var FirstInvestment = 0;
var AdditionalInvestment = 0;
var TotalRevenue = 0;
var CompleteTarget = false;
//
var maxTicket = 10;
var totalTicket = 0;
var ticketTBList = [];
var ticketSelectId = null;
//
var maxRepair = 20;
var totalRepair = 0;
var repairTBList = [];
var repairSelectId = null;
//
async function initTollBooth() {
	if(tollBoothId == null)return;
	var totalTollBooths = await contract.totalTollBooths().call();
	if(tollBoothId > totalTollBooths-1){
		no_data_found();
		return;
	}
	$('#waiting2').show();
	var tollBooth = await contract.tollBooths(tollBoothId).call();
	var tollBoothAdditional = await contract.tollBoothsAdditional(tollBoothId).call();
	for(var i in tollBoothAdditional)tollBooth[i] = tollBoothAdditional[i];
	printTollBoothDetails(tollBooth);
	//console.log(tollBooth);
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
	contract.updateTollBooth(tollBoothId, name, location, description, investment, startTime, operatorUnit, taxCode, activate).send().then(function(r) {
		uploadFile(tollBoothId, function(rs){
			window.location.reload(); 
		});
	    console.log("updateTollBooth: "+r);
	}).catch(function(e) {
		$('#waiting2').hide();
	    console.log("updateTollBooth: "+e);
	});
});



//
function no_data_found(){
	$("#admin-add-toll-booth").hide();
	$("#admin-create-ticket").hide();
	$("#admin-additional-repairs").hide();
	$("#admin-status-tb").hide();
	$('#waiting2').hide();
	$("#no_data").show();
}
//
function printTollBoothDetails(data){
	if(data.name){
		data.investment = tronWeb.fromSun(data.investment);
		$("#name").val(data.name);
		$("#location").val(data.location);
		$("#description").val(data.description);
		$("#investment").val(data.investment);
		$("#startTime").val(data.startTime);
		$("#operatorUnit").val(data.operatorUnit);
		$("#taxCode").val(data.taxCode);
		$("#activate").prop('checked', data.activate);
		//
		var _img = document.getElementById("tb-img");
		var newImg = new Image;
		newImg._img = _img
		newImg.onload = function() {
			this._img.src = this.src;
		}
		newImg.src = '../uploads/'+tollBoothId;
		//
		FirstInvestment = Number(data.investment);
		TotalRevenue = tronWeb.fromSun(data.totalRevenue);
		totalTicket = data.numTickets;
		if(totalTicket)getTicketTBList(totalTicket);
		totalRepair = data.numAdditionalRepairs;
		if(totalRepair){
			getRepairTBList(totalRepair);
		} else{
			statusTB();
		}
		if(totalTicket == 0 && totalRepair == 0){
			$('#waiting2').hide();
		}
	} else{
		no_data_found();
	}
}
//----------------------------------------------------------------------------------------------
$("#form-create-ticket").submit(function( event ) {
	// Stop form from submitting normally
	event.preventDefault();
	var forPosst = false;
	// Get some values from elements on the page:
	var $form = $(this);
	var urlPost = $form.attr( "action" );
	if(!urlPost)return;
	//
	//var urlPost = "/admin/create-ticket-tb";
	var name = $("#ct-name").val();
	var price = $("#ct-price").val();
	var vehicles = $("#ct-vehicles").val();
	var paymentAddress = $("#ct-paymentAddress").val();//return;
	price = tronWeb.toSun(price);
	//
	$('#waiting2').show();
	// Send the data using post
	contract.createTicketTB(name, vehicles, price, tollBoothId, paymentAddress).send(/*{shouldPollResponse: true}*/).then(function(r) {
		setTimeout(function(){window.location.reload();}, 2000); 
	    console.log("createTicketTB: "+r);
	}).catch(function(e) {
		$('#waiting2').hide();
	    console.log("createTicketTB: "+e);
	});
});
//
async function getTicketTBList(total){
	$('#waiting2').show();
	$("#ticket-list-table tbody").html("");
	$("#tickets-title").html(totalTicket+"/"+maxTicket);
	if(totalTicket >= maxTicket)$('#btn-create-ticket').addClass('disabled');
	var ticketTBIDs = [];
	ticketTBList = [];
	for(var i = 0; i < total; i++)ticketTBIDs.push(i);
	await Promise.all(ticketTBIDs.map(id => (
		contract.getTicketDetails(tollBoothId, id).call()
	))).then(tickets => tickets.forEach((ticket, index) => {
		//console.log(ticket);
		var data = {name: ticket[0], vehicles: ticket[1], price: tronWeb.fromSun(ticket[2]), version: ticket[3], paymentAddress: tronWeb.address.fromHex(ticket[4])};
		ticketTBList[index] = data;
		//
		var vehiclesDOM = data.vehicles.replace(new RegExp('/n', 'g'), '</br>- ');
		$("#ticket-list-table tbody").append("<tr><th>"+(index+1)+"</th><th><a style='cursor:pointer;' onclick='openEditTicket("+index+")'>"+data.name+"</a></th><th>"+data.price+" $</th><th>- "+vehiclesDOM+"</th><th>"+data.paymentAddress+"</th><th class='center-align'><a style='cursor:pointer;' onclick='openEditTicket("+index+")'><i class='fa fa-fw fa-edit' title='Edit'></i></a></th><tr>");
	}));
	//
	$('#waiting2').hide();
}
//
function openEditTicket(id){
	ticketSelectId = id;
	$("#et-name").val(ticketTBList[id].name);
	$("#et-price").val(ticketTBList[id].price);
	$("#et-vehicles").val(ticketTBList[id].vehicles);
	$("#et-paymentAddress").val(ticketTBList[id].paymentAddress);
	$("#et-version").html(""+ticketTBList[id].version);
	//
	$('#modal-edit-ticket').modal();
	$('#modal-edit-ticket').modal('open');
}
//
$("#form-edit-ticket").submit(function( event ) {
	// Stop form from submitting normally
	event.preventDefault();
	var forPosst = false;
	// Get some values from elements on the page:
	var $form = $(this);
	var urlPost = $form.attr( "action" );
	if(!urlPost)return;
	//
	//var urlPost = "/admin/create-ticket-tb";
	var name = $("#et-name").val();
	var price = $("#et-price").val();
	var vehicles = $("#et-vehicles").val();
	var paymentAddress = $("#et-paymentAddress").val();
	price = tronWeb.toSun(price);
	//alert(name+" - "+price+" - "+vehicles+" - "+ticketSelectId+" - "+paymentAddress);return;
	//
	$('#waiting2').show();
	// Send the data using post
	contract.updateTicketTB(name, vehicles, price, tollBoothId, ticketSelectId, paymentAddress).send(/*{shouldPollResponse: true}*/).then(function(r) {
		setTimeout(function(){window.location.reload();}, 2000); 
	    console.log("updateTicketTB: "+r);
	}).catch(function(e) {
		$('#waiting2').hide();
	    console.log("updateTicketTB: "+e);
	});
});

//----------------------------------------------------------------------------
$("#form-create-repair").submit(function( event ) {
	// Stop form from submitting normally
	event.preventDefault();
	var forPosst = false;
	// Get some values from elements on the page:
	var $form = $(this);
	var urlPost = $form.attr( "action" );
	if(!urlPost)return;
	//
	//var urlPost = "/admin/create-ticket-tb";
	var time = $("#ar-time").val();
	var costs = $("#ar-costs").val();
	var description = $("#ar-description").val();
	costs = tronWeb.toSun(costs);
	//alert(time+" - "+costs+" - "+description);return;
	//
	$('#waiting2').show();
	// Send the data using post
	contract.addRepairTB(time, description, costs, tollBoothId).send(/*{shouldPollResponse: true}*/).then(function(r) {
		setTimeout(function(){window.location.reload();}, 2000); 
	    console.log("addRepairTB: "+r);
	}).catch(function(e) {
		$('#waiting2').hide();
	    console.log("addRepairTB: "+e);
	});
});
//
async function getRepairTBList(total){
	$('#waiting2').show();
	$("#repairs-list-table tbody").html("");
	if(totalRepair >= maxRepair)$('#btn-create-repair').addClass('disabled');
	var repairTBIDs = [];
	repairTBList = [];
	for(var i = 0; i < total; i++)repairTBIDs.push(i);
	await Promise.all(repairTBIDs.map(id => (
		contract.getRepairDetails(tollBoothId, id).call()
	))).then(repairs => repairs.forEach((repair, index) => {
		//console.log(ticket);
		var costs = Number(tronWeb.fromSun(repair[2]))
		AdditionalInvestment += costs;
		var data = {time: repair[0], description: repair[1], costs: costs};
		repairTBList[index] = data;
		//
		$("#repairs-list-table tbody").append("<tr><th>"+(index+1)+"</th><th><a style='cursor:pointer;' onclick='openEditRepair("+index+")'>"+data.time+"</a></th><th>"+numberFormat(data.costs,{decimals:5,clear_decimals:true})+" $</th><th>"+data.description+"</th><th class='center-align'><a style='cursor:pointer;' onclick='openEditRepair("+index+")'><i class='fa fa-fw fa-edit' title='Edit'></i></a></th><tr>");
	}));
	//
	statusTB();
	$('#waiting2').hide();
}
//
function openEditRepair(id){
	repairSelectId = id;
	$("#er-time").val(repairTBList[id].time);
	$("#er-costs").val(repairTBList[id].costs);
	$("#er-description").val(repairTBList[id].description);
	//
	$('#modal-edit-repair').modal();
	$('#modal-edit-repair').modal('open');
}
//
$("#form-edit-repair").submit(function( event ) {
	// Stop form from submitting normally
	event.preventDefault();
	var forPosst = false;
	// Get some values from elements on the page:
	var $form = $(this);
	var urlPost = $form.attr( "action" );
	if(!urlPost)return;
	//
	//var urlPost = "/admin/create-ticket-tb";
	var time = $("#er-time").val();
	var costs = $("#er-costs").val();
	var description = $("#er-description").val();
	costs = tronWeb.toSun(costs);
	//alert(time+" - "+costs+" - "+description);return;
	//
	$('#waiting2').show();
	// Send the data using post
	contract.updateRepairTB(time, description, costs, tollBoothId, repairSelectId).send(/*{shouldPollResponse: true}*/).then(function(r) {
		setTimeout(function(){window.location.reload();}, 2000); 
	    console.log("updateRepairTB: "+r);
	}).catch(function(e) {
		$('#waiting2').hide();
	    console.log("updateRepairTB: "+e);
	});
});
//
function statusTB(){
	var TotalInvestment = FirstInvestment+AdditionalInvestment;
	CompleteTarget = TotalRevenue >= TotalInvestment ? true : false;
	$("#first-investment").html("First Investment: " + numberFormat(FirstInvestment,{decimals:5,clear_decimals:true}) + " $");
	$("#additional-investment").html("Additional Investment: " + numberFormat(AdditionalInvestment,{decimals:5,clear_decimals:true}) + " $");
	$("#total-investment").html("Total Investment: " + numberFormat(TotalInvestment,{decimals:5,clear_decimals:true}) + " $");
	$("#total-revenue").html("Total Revenue: " + numberFormat(TotalRevenue,{decimals:5,clear_decimals:true}) + " $");
	$("#complete-target").html("Complete Target: " + CompleteTarget);
}
//
$(document).ready(function () {
	tollBoothId = Number(getURLParameter("id"));
	if(tollBoothId >= 0){
		$("#tickets-title").html("0/"+maxTicket);
	} else{
		tollBoothId = null;
		no_data_found();
	}
});



