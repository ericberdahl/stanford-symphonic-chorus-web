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


