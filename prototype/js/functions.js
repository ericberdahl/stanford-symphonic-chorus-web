// Functions.js - this file collect smaller javascript functions used within www.stanford.edu homepage files

/*******************************************************************
Random mage - this controls the images on the Stanford homepage
********************************************************************/

// Used to display a random banner image on the homepage
// var numImages = last image number - 1

function randomBannerImg() {
	var numImages = 4; 
	var i = Math.round(numImages*Math.random());
	var i = i+ 1;
		
	var bannerDiv = document.getElementById("banner");
	
	var bannerImg = document.createElement("img");
	bannerImg.setAttribute("src", "images/content/homepage/banner/" + i + ".jpg");
	bannerImg.setAttribute("alt","Stanford scenes");
	bannerImg.className = "image_banner";
	bannerImg.setAttribute("border","0");

	bannerDiv.appendChild(bannerImg);
	
}

/*******************************************************************
Rollover image swaps - used for slide show image link
********************************************************************/

function MM_preloadImages() { //v3.0
  var d=document; if(d.images){ if(!d.MM_p) d.MM_p=new Array();
    var i,j=d.MM_p.length,a=MM_preloadImages.arguments; for(i=0; i<a.length; i++)
    if (a[i].indexOf("#")!=0){ d.MM_p[j]=new Image; d.MM_p[j++].src=a[i];}}
}

function MM_swapImgRestore() { //v3.0
  var i,x,a=document.MM_sr; for(i=0;a&&i<a.length&&(x=a[i])&&x.oSrc;i++) x.src=x.oSrc;
}

function MM_findObj(n, d) { //v4.01
  var p,i,x;  if(!d) d=document; if((p=n.indexOf("?"))>0&&parent.frames.length) {
    d=parent.frames[n.substring(p+1)].document; n=n.substring(0,p);}
  if(!(x=d[n])&&d.all) x=d.all[n]; for (i=0;!x&&i<d.forms.length;i++) x=d.forms[i][n];
  for(i=0;!x&&d.layers&&i<d.layers.length;i++) x=MM_findObj(n,d.layers[i].document);
  if(!x && d.getElementById) x=d.getElementById(n); return x;
}

function MM_swapImage() { //v3.0
  var i,j=0,x,a=MM_swapImage.arguments; document.MM_sr=new Array; for(i=0;i<(a.length-2);i+=3)
   if ((x=MM_findObj(a[i]))!=null){document.MM_sr[j++]=x; if(!x.oSrc) x.oSrc=x.src; x.src=a[i+2];}
}

/*******************************************************************
Expanded drawer - Mootools domready event along hide/show calls for the expanded navigation
********************************************************************/


window.addEvent('domready', function(){
			//-vertical
	
		//var mySlide = new Fx.Slide('expanded_content').hide();
		var mySlide = new Fx.Slide('expanded_content').hide();
		
		/*element.setStyle('opacity', 0);*/
 	
/*$('slidein').addEvent('click', function(e){
	e = new Event(e);
	mySlide.slideIn();
	e.stop();
});
 
$('slideout').addEvent('click', function(e){
	e = new Event(e);
	mySlide.slideOut();
	e.stop();
});*/
var i = 2;

$('toggle').addEvent('click', function(e){
	
	e = new Event(e);
	document.getElementById('nav_expanded').style.visibility = "visible";	
	document.getElementById('nav_expanded').style.display = "block";	
	document.getElementById('expanded_content').style.display = "block";
	mySlide.toggle();
	
	
	e.stop();
	i = i + 1;
     if (i % 2 == 0) {
		document.getElementById('toggle').innerHTML = "<img src='images/icon_expanded.jpg' id='expanded_icon' />Show Expanded Menus";
		
	}
	 if (i % 2 != 0) {
		document.getElementById('toggle').innerHTML = "<img src='images/icon_expanded.jpg' id='expanded_icon' />Hide Expanded Menus";
		
	}

});
 
/*$('hide').addEvent('click', function(e){
	e = new Event(e);
	mySlide.hide();
	e.stop();
});*/
		
		
		}); 

/*******************************************************************
Search box switching - Function to assist in the web/people search switching
********************************************************************/

		function switch_people_search() { 
			document.getElementById('web_search').style.visibility = 'hidden';
			document.getElementById('web_search').style.display = 'none';  
			document.getElementById('people_search').style.visibility = 'visible';
			document.getElementById('people_search').style.display = 'block';
			document.getElementById('web').style.backgroundImage = 'none';
			document.getElementById('web').style.backgroundColor = '#910101';
			document.getElementById('people').style.backgroundColor = '#fff';
			document.getElementById('web_link').style.color = '#fff';
			document.getElementById('people_link').style.color = '#3f3c30';
			
			}
			
			function switch_web_search() {
			document.getElementById('web_search').style.visibility = 'visible'; 
			document.getElementById('web_search').style.display = 'block'; 
			document.getElementById('people_search').style.visibility = 'hidden';
			document.getElementById('people_search').style.display = 'none';
			document.getElementById('people').style.backgroundImage = 'none';
			document.getElementById('people').style.backgroundColor = '#910101';
			document.getElementById('web').style.backgroundColor = '#fff'
			document.getElementById('web_link').style.color = '#3f3c30';
			document.getElementById('people_link').style.color = '#fff';
			
			}
			
				function writeJS(){
			var str='';
			str+='<ul>';
			str+='          <li id="web"><a href="javascript:switch_web_search();" id="web_link"> Web<\/a><\/li>  ';
			str+='     	 <li id="people"><a href="javascript:switch_people_search();" id="people_link">People<\/a><\/li>';
			str+='    ';
			str+='          <\/ul>';
			document.write(str);
			}


