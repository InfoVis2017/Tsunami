var scrolling = false

function togglescrolling(){
  scrolling = (! scrolling);
  if (scrolling) {
    document.getElementById("scrolltoggle").classList.add("active");
    startautoslide();
    return false;
  } else {
    document.getElementById("scrolltoggle").classList.remove("active");
    return false;
  }
  return false;
}

function startautoslide(){
 end   = 2017;
 scrolling = true;
 autoslide(end);
 return false;
}

function autoslide(end, interval = 1000){
  var start = parseInt(document.getElementsByTagName('input')[0].value) + 1;
  if (scrolling) {
    if (start <= end){
      document.getElementsByTagName('input')[0].value = start;
      setYear(start);
      window.setTimeout(function() {autoslide(end, interval)}, interval);
    }
    else {
      togglescrolling();
    }
  }
}