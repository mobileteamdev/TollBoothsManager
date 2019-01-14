//
var totalTollBooths = 0;
var perPage = 10;
var currentPage = Number(getURLParameter("page"));
//
async function initTollBooth() {
	totalTollBooths = await contract.totalTollBooths().call();
	totalTollBooths = Number(totalTollBooths);
	if(totalTollBooths)getTollBoothListPage(currentPage);
}

//
async function getTollBoothDetails(tollBoothListData){
	await Promise.all(tollBoothListData.map(tbID => (
		contract.tollBooths(tbID).call()
	))).then(tollBooths => tollBooths.forEach((tbDetails, index) => {
		var data = tbDetails;//transformData(tbDetails);
		data.totalInvestment = tronWeb.fromSun(data.totalInvestment);
		data.totalRevenue = tronWeb.fromSun(data.totalRevenue);
		//data.totalRevenue = 1;
		var completeTarget = data.totalRevenue >= data.totalInvestment ? true : false;
		var process = Math.floor(data.totalRevenue/data.totalInvestment*100);
		var width = 160/100*process;
		var tollBoothId = tollBoothListData[index];
		var imgId = "img-"+tollBoothId;
		var processDOM = completeTarget+"</br><div class='tb-process1'><div class='tb-process2' style='width:"+width+"px'></div><div class='tb-process3'>"+process+"%</div></div>";
		$("#toll-booth-list-table tbody").append("<tr><th><a href='toll_booth.html?id="+tollBoothId+"'><img class='tb-img' id='"+imgId+"' src='img/tollbooth.jpg'/></a></th><th><a href='toll_booth.html?id="+tollBoothId+"'>"+data.name+"</a></th><th>"+data.startTime+"</th><th class='center-align'>"+data.activate+"</th><th>Revenue: "+numberFormat(data.totalRevenue,{decimals:5,clear_decimals:true})+" $</br>Investment: "+numberFormat(data.totalInvestment,{decimals:5,clear_decimals:true})+" $</th><th>"+processDOM+"</th><tr>");
		//
		var _img = document.getElementById(imgId);
		var newImg = new Image;
		newImg._img = _img
		newImg.onload = function() {
			this._img.src = this.src;
		}
		newImg.src = 'uploads/'+tollBoothId;
		//
		$('#waiting2').hide();
		//console.log(data);
	}));
}
//
function getTollBoothListPage(page){
	$('#waiting2').show();
	//
	var pages = Math.ceil(totalTollBooths / perPage);
	page = Number(page);
	if(!page)page = 1;
	if(page > pages)page = pages;
	if(page != window.currentPage){
		window.currentPage = page;
		window.history.pushState('', '', updateURLParameter(window.location.href, "page", page));
	}
	//
	window.tollBoothList = [];
	var from = totalTollBooths-perPage*(currentPage-1);
	var to = from-perPage;
	if(to < 0)to = 0;
	for(var i = from-1; i >= to; i--)tollBoothList.push(i);//alert(tollBoothList)
	//
	$("#toll-booth-list-table tbody").remove();
	$("#toll-booth-list-table").append("<tbody></tbody>");
	getTollBoothDetails(tollBoothList);
	//
	var model = 'tb';
	$('.pagination-'+model).html(getPagination(model, currentPage, pages));
}
//-----------------------------------------------------------------------------------------------------------------
var getPagination = function(model, current, pages){
	if(!current)current = 1;
	if(pages < current)pages = current;
	var html = "";
	if (current == 1) {
		html += "<li class='disabled'><a>First</a></li>"
	} else {
		html += "<li><a onclick='paginationGetData(&quot;"+model+"&quot;, 1)'>First</a></li>";
	}
	var i = (Number(current) > 3 ? Number(current) - 2 : 1)
	if (i !== 1) {
		html += "<li class='disabled'><a>...</a></li>";
	}
	for (; i <= (Number(current) + 2) && i <= pages; i++) {
		if (i == current) {
			html += "<li class='active'><a>"+i+"</a></li>";
		} else {
			html += "<li><a onclick='paginationGetData(&quot;"+model+"&quot;,  "+i+")'>"+i+"</a></li>";
		}
		if (i == Number(current) + 2 && i < pages) {
			html += "<li class='disabled'><a>...</a></li>";
		}
	}
	if (current == pages) {
		html += "<li class='disabled'><a>Last</a></li>";
	} else {
		html += "<li><a onclick='paginationGetData(&quot;"+model+"&quot;,  "+pages+")'>Last</a></li>";
	}
	return html;
}
//
var paginationGetData = function(model, page){
	if(!model)return;
	getTollBoothListPage(page);
}
