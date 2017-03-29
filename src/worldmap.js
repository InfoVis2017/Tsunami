var basic;

function setup(){
	basic = new Datamap({
  element: document.getElementById("map")
});
}
/*Probably unnecessary*/
window.onload = setup