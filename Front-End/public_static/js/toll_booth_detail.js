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
		FirstInvestment = Number(tronWeb.fromSun(data.investment));
		$("#name").html(data.name);
		$("#location").html(data.location);
		$("#description").html(data.description);
		$("#investment").html(numberFormat(FirstInvestment,{decimals:5,clear_decimals:true}));
		$("#startTime").html(data.startTime);
		$("#operatorUnit").html(data.operatorUnit);
		$("#taxCode").html(""+data.taxCode);
		$("#activate").html(data.activate);
		//
		var _img = document.getElementById("tb-img");
		var newImg = new Image;
		newImg._img = _img
		newImg.onload = function() {
			this._img.src = this.src;
		}
		newImg.src = 'uploads/'+tollBoothId;
		//
		TotalRevenue = Number(tronWeb.fromSun(data.totalRevenue));
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
		$("#ticket-list-table tbody").append("<tr><th>"+(index+1)+"</th><th><a>"+data.name+"</a></th><th>"+data.price+" $</th><th>- "+vehiclesDOM+"</th><th>"+data.paymentAddress+"</th><tr>");
	}));
	//
	$('#waiting2').hide();
}
//----------------------------------------------------------------------------
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
		$("#repairs-list-table tbody").append("<tr><th>"+(index+1)+"</th><th><a>"+data.time+"</a></th><th>"+numberFormat(data.costs,{decimals:5,clear_decimals:true})+" $</th><th>"+data.description+"</th><tr>");
	}));
	//
	statusTB();
	$('#waiting2').hide();
}
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
		$("#btn-buy-tickets").attr("href", "toll_booth_payment.html?id="+tollBoothId);
	} else{
		tollBoothId = null;
		no_data_found();
	}
});



