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
 start = parseInt(document.getElementsByTagName('input')[0].value)
 end   = 2017;
 scrolling = true;
 autoslide(start, end);
 return false;
}

function autoslide(start, end, interval = 1000){
  if (scrolling) {
    if (start <= end){
      document.getElementsByTagName('input')[0].value = start;
      setYear(start);
      window.setTimeout(function() {autoslide(start+1, end, interval)}, interval);
    }
  }
}