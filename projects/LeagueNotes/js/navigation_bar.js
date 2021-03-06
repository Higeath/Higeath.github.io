// DOM Ready

if($(window).width() > 640){
	$(function() {
		var $el, leftPos, newWidth;
		$("#example-one").append("<li id='magic-line'></li>");
		/* Cache it */
		var $magicLine = $("#magic-line");
		$magicLine
			.width($(".current_page_item").width())
			.css("left", $(".current_page_item a").position().left)
			.data("origLeft", $magicLine.position().left)
			.data("origWidth", $magicLine.width());
		$("#example-one li").find("a").hover(function() {
			$el = $(this);
			leftPos = $el.position().left;
			newWidth = $el.parent().width();
			
			$magicLine.stop().animate({
				left: leftPos,
				width: newWidth
			});
		}, function() {
			$magicLine.stop().animate({
				left: $magicLine.data("origLeft"),
				width: $magicLine.data("origWidth")
			});    
		});
	});
}

