const navItemClick = ($item) => {
	$item.classList.add("active");
	
	const $links = document.querySelectorAll(".nav-item.nav-link");

	[].forEach.call($links, function($link) {
		
		// onClick listener
		if($link.getAttribute("id") !== $item.getAttribute("id")){
			$link.classList.remove("active");
		}
	});
};