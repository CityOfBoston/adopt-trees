var map = new google.maps.Map(document.getElementById("map"), {
  center: new google.maps.LatLng( 42.323206, -71.074847 ),
  zoom: 11,
  mapTypeId: google.maps.MapTypeId.ROADMAP,
  streetViewControl: false
});

var geocoder = new google.maps.Geocoder();

var ft = new google.maps.FusionTablesLayer({map:map,suppressInfoWindows:true,query:{select:"'Geocodable address'",from:"1tLgQtXM47Nmu5Bb7x2oh10A425EqXFS7dFugK_0"},styles:[{markerOptions:{iconName:"small_green"}}]});
var infoWindow = new google.maps.InfoWindow();
var useColumns = [ "Neighborhood", "Priority", "Tree Species to be planted", "TIS #/ SOURCE" ];
google.maps.event.addListener(ft, "click", function(e){
  if(map.getZoom() < 16){
    map.setCenter(e.latLng);
    map.setZoom(16);
  }

  // enable adopt button
  document.getElementById("adoptme").className = "btn btn-success";
  document.getElementById("adoptme").disabled = "";
  document.getElementById("adoptme").onclick = function(){
    var id = e.row["TIS #/ SOURCE"].value;
    window.location = "form.html?id=" + id;
  };
  
  var content = "";
  for(var c in e.row){
    var columnName = e.row[c].columnName;
    if(useColumns.indexOf(columnName) > -1){
      var value = e.row[c].value;
      content += "<strong>" + columnName.toLowerCase() + "</strong>: " + value.toLowerCase() + "<br/>";
    }
  }
  infoWindow.setContent(content);
  infoWindow.setPosition(e.latLng);
  infoWindow.open(map);
});

var searchbar = document.createElement("div");
searchbar.id = "searchbar";

var address = document.createElement("input");
address.id = "address";
address.className = "x-large";
address.type = "text";
address.onkeydown = function(e){
  if(e.keyCode == 13){
    searchAddress();
  }
};
searchbar.appendChild(address);

var sbtn = document.createElement("button");
sbtn.className = "btn btn-primary";
sbtn.innerHTML = "Search";
sbtn.onclick = searchAddress;
searchbar.appendChild(sbtn);

document.getElementById("map").appendChild(searchbar);

var searchAddress = function(){
  var lookup = document.getElementById("address").value;
  if(lookup.toLowerCase().indexOf("boston") == -1){
    lookup += ", Boston, MA";
  }
  geocoder.geocode( { 'address': lookup }, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
      map.setZoom(16);
    }
  });
};