import { isPwa, installApp } from './modules/pwa-module.js';






if(isPwa()){
	document.querySelector("a[id='5']").style.display = "none";
}else{
	document.querySelector("a[id='5']").style.display = "inline";
}