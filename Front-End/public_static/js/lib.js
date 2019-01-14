const timeToast = 3000
function activeTolltip(){
	$('.tooltipped').tooltip({
		delay: 0,
		position: 'top',
	});
}
// loadding
function loadingSend(ob, state, oldName){
	if (state) {
		ob.attr('disabled', 'disabled')
		ob.html('<i class="fa fa-spinner fa-spin fa-fw"></i>')
	} else {
		ob.removeAttr('disabled')
		ob.html(oldName)
	}
}
// convert string
function convertToSlug(title){
	title = title ? title : ""
  var slug;
  slug = title.toLowerCase();
  slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
  slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
  slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
  slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
  slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
  slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
  slug = slug.replace(/đ/gi, 'd');
  slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
  slug = slug.replace(/ /gi, " - ");
  slug = slug.replace(/\-\-\-\-\-/gi, '-');
  slug = slug.replace(/\-\-\-\-/gi, '-');
  slug = slug.replace(/\-\-\-/gi, '-');
  slug = slug.replace(/\-\-/gi, '-');
  slug = '@' + slug + '@';
  slug = slug.replace(/\@\-|\-\@|\@/gi, '');
  return slug
}
function checkTimeTransaction (timeStart, timeEnd) {
	var hourStart = parseInt(timeStart.split(':')[0], 10)
	var mStart = parseInt(timeStart.split(':')[1], 10)
	var hourEnd = parseInt(timeEnd.split(':')[0], 10)
	var mEnd = parseInt(timeEnd.split(':')[0], 10)
	var d = new Date()
	var h = d.getHours()
	var m = d.getMinutes()
	if(h < hourStart || (hourStart == h && m < mStart) || h > hourEnd || (hourEnd == h && m > mEnd)){
		return false
	}
	return true
}
//new
// http://kevin.vanzonneveld.net - PHP style number_format
number_format = function(number, decimals, dec_point, thousands_sep) {
	var n = !isFinite(+number) ? 0 : +number,
		prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
		sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
		dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
		s = '',
		toFixedFix = function (n, prec) {
			var k = Math.pow(10, prec);
			return '' + Math.round(n * k) / k;
		};
	// Fix for IE parseFloat(0.55).toFixed(0) = 0;
	s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
	if (s[0].length > 3) {
		s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
	}
	if ((s[1] || '').length < prec) {
		s[1] = s[1] || '';
		s[1] += new Array(prec - s[1].length + 1).join('0');
	}
	return s.join(dec);
};
//
numberFormat = function (number, opts) {
	opts = opts || {};
	if (typeof opts.decpoint === 'undefined')
		opts.decpoint = '.';
	if (typeof opts.sep === 'undefined')
		opts.sep = ',';
	if (typeof opts.decimals === 'undefined')
		opts.decimals = 0;
	//new
	number = Number(number);
    if(number < 1 && number > 0){//số >0&<1 (vd 0.00000003) hiển thị là 3e-8 dùng toString sẽ trả về 0 nên dùng toFixed
      var res = number.toFixed(opts.decimals).split(".");
      var length = res[1].length;
      if(opts.limit_length_decimals && opts.limit_length_decimals < length)length = opts.limit_length_decimals;
      if(opts.clear_decimals){
        for(var i = length-1; i >= 0; i--){
          if(res[1][i] > 0)break;
          length--;
        }
      }
      return number.toFixed(length);
    }
	if(opts.decimals && opts.clear_decimals){
    	var res = number.toString().split(".");
        if(res.length == 1){
        	opts.decimals = 0;
        } else{
            var new_decimals = res[1].substring(0, opts.decimals);
            var length = new_decimals.length;
            for(var i = new_decimals.length-1; i >= 0; i--){
            	if(new_decimals[i] > 0)break;
            	length--;
            }
            opts.decimals = length;
			if(opts.limit_length_decimals){//chỉ để hiển thị tượng trưng, cần hiển thị chính xác thì k dùng
            	var max_decimals = opts.limit_length_decimals - res[0].length;
                if(max_decimals < 0)max_decimals = 0;
                if(opts.decimals > max_decimals)opts.decimals = max_decimals;
            }
        }
	}
	return number_format(number, opts.decimals, opts.decpoint, opts.sep);
};
//
function copyToClipboard(id, text) {
	if(!text)text = "Copied";
	$('#'+id).focus();
	$('#'+id).select();
	document.execCommand("copy");
	var temp = '<p id="da-sao-chep"> '+text+' </p>'
	$('body').append(temp)
	setTimeout(function(){ $('#da-sao-chep').remove()  }, 2000);
}
//
function copyToClipboard2(containerid, div2_alert1, text){
	if(!text)text = "Copied";
	if (document.selection) { 
		document.selection.empty();
		var range = document.body.createTextRange();
		range.moveToElementText(document.getElementById(containerid));
		range.select().createTextRange();
		document.execCommand("copy"); 
		if(div2_alert1 == 2){
			var top = $("#"+containerid).offset().top; top > 40 ? top-=40 : top = 0;
			var left = $("#"+containerid).offset().left;
			var temp = '<p id="alert-copyed" style="top:'+top+'px; left: '+left+'px"> '+text+' </p>';
			$('body').append(temp);
			setTimeout(function(){ $('#alert-copyed').remove()  }, 800);
		} else if(div2_alert1 == 1){
			alert(text+": "+window.getSelection());
		}
	
	} else if (window.getSelection) {
		window.getSelection().removeAllRanges();
		var range = document.createRange();
		 range.selectNode(document.getElementById(containerid));
		 window.getSelection().addRange(range);
		 document.execCommand("copy");
		if(div2_alert1 == 2){
			var top = $("#"+containerid).offset().top; top > 40 ? top-=40 : top = 0;
			var left = $("#"+containerid).offset().left;
			var temp = '<p id="alert-copyed" style="top:'+top+'px; left: '+left+'px"> '+text+' </p>';
			$('body').append(temp);
			setTimeout(function(){ $('#alert-copyed').remove()  }, 800);
		} else if(div2_alert1 == 1){
			alert(text+": "+window.getSelection());
		}
	}
}
//
function validateContainsLetter(string){
  var re = /[a-zA-Z]/;
  return re.test(String(string));
}
//
function validateMinMax(string, min, max) {
	if(!string)return false;
	if(min && string.length < min)return false;
	if(max && string.length > max)return false;
	return true;
}
//
function validateNickname(string){
  //var re = /^[0-9A-Za-z\s\-]+$/;//k chứ ký tự đặc biệt, chứa a-z A-Z 0-9 space "-"
  var re = /^[0-9A-Za-z\-]+$/;//k chứ ký tự đặc biệt, chứa a-z A-Z 0-9 "-"
  return re.test(String(string));
}
//
function validateEmail(email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}
//
function validateOnlyNumber(string){
  var re = /^\d+$/;
  return re.test(String(string));
}
//
function getURLParameter(param){
	var paramVal = null;
    var TheAnchor = null;
    var tempArray = window.location.href.split("?");
    var additionalURL = tempArray[1];
    if (additionalURL){
        var tmpAnchor = additionalURL.split("#");
        var TheParams = tmpAnchor[0];
            TheAnchor = tmpAnchor[1];
        tempArray = TheParams.split("&");
        for (var i=0; i<tempArray.length; i++){
			var pr = tempArray[i].split('=');
            if(pr.length == 2 && pr[0] == param){
                paramVal = pr[1];
				break;
            }
        }        
    }
    return paramVal;
}
//
function updateURLParameter(url, param, paramVal){
    var TheAnchor = null;
    var newAdditionalURL = "";
    var tempArray = url.split("?");
    var baseURL = tempArray[0];
    var additionalURL = tempArray[1];
    var temp = "";
    if (additionalURL){
        var tmpAnchor = additionalURL.split("#");
        var TheParams = tmpAnchor[0];
            TheAnchor = tmpAnchor[1];
        if(TheAnchor)additionalURL = TheParams;
        tempArray = additionalURL.split("&");
        for (var i=0; i<tempArray.length; i++){
            if(tempArray[i].split('=')[0] != param){
                newAdditionalURL += temp + tempArray[i];
                temp = "&";
            }
        }        
    } else{
        var tmpAnchor = baseURL.split("#");
        var TheParams = tmpAnchor[0];
            TheAnchor  = tmpAnchor[1];
        if(TheParams)baseURL = TheParams;
    }
    if(TheAnchor)paramVal += "#" + TheAnchor;
    var rows_txt = temp + "" + param + "=" + paramVal;
    return baseURL + "?" + newAdditionalURL + rows_txt;
}