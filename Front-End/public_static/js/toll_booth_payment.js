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
//
var totalRepair = 0;
//
var cars = [[{name:"car1-1", cnp:"BK1-46836"}, {name:"car1-2", cnp:"BK2-38945"}, {name:"car1-3", cnp:"BK3-95274"}, {name:"car1-4", cnp:"BK4-49204"}], [{name:"car2-1", cnp:"NF1-37384"}, {name:"car2-2", cnp:"NF2-48275"}], [{name:"car3-1", cnp:"DH1-48365"}, {name:"car3-2", cnp:"DH2-47834"}], [{name:"car4-1", cnp:"JK1-37456"}, {name:"car4-2", cnp:"JK1-85674"}]];//cnp (car number plates)
var gates = [{},{current:0},{current:0}];
var ticketAtGate = [];
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
		$(".tbName").html(data.name);
		FirstInvestment = Number(tronWeb.fromSun(data.investment));
		TotalRevenue = Number(tronWeb.fromSun(data.totalRevenue));
		totalTicket = data.numTickets;
		if(totalTicket)getTicketTBList(totalTicket);
		totalRepair = data.numAdditionalRepairs;
		if(totalRepair){
			getRepairTBList(totalRepair);
		} else{
			statusTB();
		}
		//
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
	var forRand = totalTicket;
	if(forRand > 4)forRand = 4;
	gates[1].current = Math.floor(Math.random()*forRand);
	gates[2].current = Math.floor(Math.random()*forRand);
	NextCar(1);
	NextCar(2)
	//
	$('#waiting2').hide();
}
//----------------------------------------------------------------------------
async function getRepairTBList(total){
	$('#waiting2').show();
	var repairTBIDs = [];
	for(var i = 0; i < total; i++)repairTBIDs.push(i);
	await Promise.all(repairTBIDs.map(id => (
		contract.getRepairDetails(tollBoothId, id).call()
	))).then(repairs => repairs.forEach((repair, index) => {
		//console.log(ticket);
		var costs = Number(tronWeb.fromSun(repair[2]))
		AdditionalInvestment += costs;
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
function NextCar(gate){
	if(totalTicket == 0){
		alert("Not find a certain type of ticket!");
		return;
	}
	var currentType = gates[gate].current;
	var cars_length = cars[currentType].length;
	var car_selected = Math.floor(Math.random()*cars_length);
	var car = cars[currentType][car_selected];
	$("#car"+gate).attr("src", "img/"+car.name+".png");
	//
	var tkName = ticketTBList[currentType].name;
	var tkPrice = ticketTBList[currentType].price;
	$("#screen"+gate).html(car.cnp+"</br>"+tkName+" - "+tkPrice+" $");
	//
	ticketAtGate[gate] = {car_cnp: car.cnp, tkType: currentType, tkName: tkName, tkPrice: tkPrice, time: new Date().getTime()};
	//
	gates[gate].current++;
	if(gates[gate].current > 3 || gates[gate].current >= totalTicket)gates[gate].current = 0;
}
//
function BuyTicket(gate){
	if(!state.tronWeb.loggedIn){
		if(state.tronWeb.installed){
			$("#tronLink-loginModal").modal("open");
		} else{
			$("#tronLink-installModal").modal("open");
		}
		return;
	}
	selectedGate = gate;
	//alert("BuyTicket: "+JSON.stringify(ticketAtGate[gate]));
	BuyTicketSend(ticketAtGate[gate], serverReturns);
}
//
function serverReturns(rl) {//alert(rl)
	if(rl == 0)return;
	contract.tollBooths(tollBoothId).call().then(function(r) {
		if(r.totalRevenue){
			TotalRevenue = Number(tronWeb.fromSun(r.totalRevenue));
			$("#total-revenue").html("Total Revenue: " + numberFormat(TotalRevenue,{decimals:5,clear_decimals:true}) + " $");
			
			$("#ps1").html("Car number plates: <b>"+ticketAtGate[selectedGate].car_cnp+"<b>");
			$("#ps2").html("Ticket type: <b>"+ticketAtGate[selectedGate].tkName+"<b>");
			$("#ps3").html("Ticket price: <b>"+ticketAtGate[selectedGate].tkPrice+" $<b>");
			$("#buyTicketDoneModal").modal("open");
		}
	    //console.log("tollBooths: "+JSON.stringify(r));
	}).catch(function(e) {
		NextCar(selectedGate);
	    //console.log("tollBooths: "+e);
	});
}
//
function carGo(){
	NextCar(selectedGate);
}
//
$(document).ready(function () {
	tollBoothId = Number(getURLParameter("id"));
	if(tollBoothId >= 0){
		$("#tickets-title").html("0/"+maxTicket);
		$("#btn-back").attr("href", "toll_booth.html?id="+tollBoothId);
	} else{
		tollBoothId = null;
		no_data_found();
	}
});



