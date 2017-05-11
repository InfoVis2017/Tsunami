  function autoslide(start, end, interval = 500){
    if (start <= end){
      document.getElementsByTagName('input')[0].value = start;
      setYear(start);
      document.getElementsByTagName('output')[0].innerHTML = start;
      window.setTimeout(function() {autoslide(start+1, end, interval)}, interval);
    }
  }