function init () {
	stripeTables();	
}


function stripeTables() {
	var tables = getElementsByClassName("data", "table");
	for (var i=0; i<tables.length; i++) {
	var rows = tables[i].getElementsByTagName("tr");
		for (var j=0; j<rows.length; j=j+2) {
		  addClass(rows[j],"odd");
		}
	}
}

function setSearchFocus() {
document.getElementById("search_string").focus()
}

function popUp(winURL) {
	window.open(winURL, "popup", "width=650,height=1000");
}

function openWindow(url, windowname, width, height, toolbar){
        var sizestring = 'width=' + width + ',height=' + height;
	SmallWin = window.open(url,windowname,'scrollbars,resizable,' + sizestring +',toolbar='+toolbar+',location=0,status=0,directories=0,menubar='+toolbar);
	SmallWin.focus();	
}

function addClass(element,name) {
  if (!element.className) {
    element.className = name;
  } else {
    element.className+= " ";
    element.className+= name;
  }
}

function getElementsByClassName(strClass, strTag, objContElm) {
  strTag = strTag || "*";
  objContElm = objContElm || document;
  var objColl = (strTag == '*' && document.all && !window.opera) ? document.all : objContElm.getElementsByTagName(strTag);
  var arr = new Array();
  var delim = strClass.indexOf('|') != -1  ? '|' : ' ';
  var arrClass = strClass.split(delim);
  for (var i = 0, j = objColl.length; i < j; i++) {
    var arrObjClass = objColl[i].className.split(' ');
    if (delim == ' ' && arrClass.length > arrObjClass.length) continue;
    var c = 0;
    comparisonLoop:
    for (var k = 0, l = arrObjClass.length; k < l; k++) {
      for (var m = 0, n = arrClass.length; m < n; m++) {
        if (arrClass[m] == arrObjClass[k]) c++;
        if (( delim == '|' && c == 1) || (delim == ' ' && c == arrClass.length)) {
          arr.push(objColl[i]);
          break comparisonLoop;
        }
      }
    }
  }
  return arr;
}

function prepareLinks() {
	var links = document.getElementsByTagName("a");
	for (var i=0; i<links.length; i++) {
		if (links[i].getAttribute("class") == "slideshow") {
			links[i].onclick = function() {
				popUp(this.getAttribute("href"));
				return false;
			}
		}
	}
}

window.onload = init;

