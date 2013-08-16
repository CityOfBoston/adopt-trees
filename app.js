if(typeof console == "undefined" || !console || typeof console.log != "function"){
  console = {
    log: function(){}
  };
}

var treeaddress, treetype, latin, bday;

var map = new google.maps.Map(document.getElementById("map"), {
  center: new google.maps.LatLng( 42.323206, -71.074847 ),
  zoom: 11,
  mapTypeId: google.maps.MapTypeId.ROADMAP,
  streetViewControl: false
});

var geocoder = new google.maps.Geocoder();

var ft = new google.maps.FusionTablesLayer({map:map,suppressInfoWindows:true,query:{select:"'Geocodable address'",from:"18amWr6Z69048wr2b5B-W1Cmc2Thiu9Tj5-xvy8k"},styles:[{markerOptions:{iconName:"small_green"}},{markerOptions:{iconName:"small_blue"},where:"Adopted=1"}]});
var infoWindow = new google.maps.InfoWindow();
google.maps.event.addListener(ft, "click", function(e){
  console.log(e.row);

  if(map.getZoom() < 16){
    map.setCenter(e.latLng);
    map.setZoom(16);
  }
  
  var content = "<h3>" + e.row["Common Name"].value + "</h3>";
  content += "<i>" + latinify(e.row["Latin Name"].value) + "</i><br/>";
  content += "<div>Planted " + e.row["Birthdate"].value + " at ";
  content += "<span class='address'>" + e.row["Address"].value.toLowerCase() + ".</span><br/>" + e.row["Neighborhood"].value + "<br/>This tree is ";
  var age = getAge( e.row );
  if(age == 1){
    content += "1 year old.";
  }
  else{
    content += age + " years old.";
  }
  content += "</div>";
  if(e.row["Adopted"].value == 1){
    content += "<div class='adopted greenovate-cyan'>Adopted</div>";
  }
  infoWindow.setContent(content);
  infoWindow.setPosition(e.latLng);
  infoWindow.open(map);

  // enable adopt button
  document.getElementById("adoptme").className = "btn btn-success greenovate-green";
  document.getElementById("adoptme").disabled = "";
  document.getElementById("adoptme").onclick = function(){
    //var id = e.row["TIS #/ SOURCE"].value;
    //window.location = "form.html?id=" + id;
    treeaddress = e.row["Address"].value;
    treetype = e.row["Common Name"].value;
    latin = latinify(e.row["Latin Name"].value);
    bday = e.row["Birthdate"].value;
    adoptWindow();
  };

});

var searchbar = document.createElement("div");
searchbar.id = "searchbar";

var address = document.createElement("input");
address.id = "address";
address.placeholder = "Address";
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

// for trees without set birthdays, their birthday is the first day of their planting season
// after 2030, use first day of season in planted-year as birthday
// for trees planted after 2030, use first day of season in 2030 as birthday
var seasons = {
  spring: [ "3/20/2008","3/20/2009","3/20/2010","3/20/2011","3/20/2012","3/20/2013","3/20/2014","3/20/2015","3/20/2016","3/20/2017","3/20/2018","3/20/2019","3/19/2020","3/20/2021","3/20/2022","3/20/2023","3/19/2024","3/20/2025","3/20/2026","3/20/2027","3/19/2028","3/20/2029","3/20/2030" ],
  fall: [ "9/22/2008","9/22/2009","9/22/2010","9/23/2011","9/22/2012","9/22/2013","9/22/2014","9/23/2015","9/22/2016","9/22/2017","9/22/2018","9/23/2019","9/22/2020","9/22/2021","9/22/2022","9/23/2023","9/22/2024","9/22/2025","9/22/2026","9/23/2027","9/22/2028","9/22/2029","9/22/2030" ]
};
function getAge(tree){
  var birthdate = tree["Birthdate"].value.toLowerCase();
  var age;
  if(birthdate.indexOf("fall") > -1 || birthdate.indexOf("spring") > -1){
    var currentYear = (new Date()).getFullYear();
    var birthYear = 1 * birthdate.replace("spring","").replace("fall","").replace(" ","").replace(" ","").replace(" ","");
    var lastYear = (new Date(seasons.fall[ seasons.fall.length-1 ])).getFullYear();
    if(birthYear <= lastYear){
      age = currentYear - birthYear;
      if(currentYear <= lastYear){
        // can compare to this season
        if(birthdate.indexOf("spring") > -1){
          for(var s=0;s<seasons.spring.length;s++){
            if((new Date(seasons.spring[s])).getFullYear() == currentYear){
              if( new Date(seasons.spring[s]) > new Date() ){
                // birthday coming up this year
                age--;
              }
              break;
            }
          }
        }
        else{
          for(var s=0;s<seasons.fall.length;s++){
            if((new Date(seasons.fall[s])).getFullYear() == currentYear){
              if( new Date(seasons.fall[s]) > new Date() ){
                // birthday coming up this year
                age--;
              }
              break;
            }
          }
        }
      }
      else{
        // compare to last year in system
        var currentdate = new Date();
        if(birthdate.indexOf("spring") > -1){
          var lastbirthdate = new Date(seasons.spring[ seasons.spring.length-1 ]);
          if( lastbirthdate.getMonth() > currentdate.getMonth() || ( lastbirthdate.getMonth() == currentdate.getMonth() && lastbirthdate.getDate() >= currentdate.getDate() ) ){
            // birthday coming up this year
            age--;
          }
        }
        else{
          var lastbirthdate = new Date(seasons.fall[ seasons.fall.length-1 ]);
          if( lastbirthdate.getMonth() > currentdate.getMonth() || ( lastbirthdate.getMonth() == currentdate.getMonth() && lastbirthdate.getDate() >= currentdate.getDate() ) ){
            // birthday coming up this year
            age--;
          }
        }
      }
    }
    else{
      // planted after last year in system
      if(birthdate.indexOf("spring") > -1){
        age = (new Date()) * 1 - (new Date(seasons.spring[ seasons.spring.length-1 ])) * 1;
      }
      else{
        age = (new Date()) * 1 - (new Date(seasons.fall[ seasons.fall.length-1 ])) * 1;
      }
      age = Math.floor(age / (365 * 24 * 60 * 60 * 1000));
    }
  }
  else{
    // specific birthdate
    age = (new Date()) * 1 - (new Date(tree["Birthdate"].value)) * 1;
    age = Math.floor(age / (365 * 24 * 60 * 60 * 1000));
  }
  return age;
}

function latinify(name){
  name = name[0].toUpperCase() + name.substring(1).toLowerCase();
  return name;
}

function adoptWindow(){
  TINY.box.show({html: document.getElementById("adoptformtemp").innerHTML ,animate:true,close:true,boxid:'adoptform',top:5});
  setTimeout(function(){
    for(var i=0;i<document.getElementsByClassName("treeaddress").length;i++){
      if(typeof document.getElementsByClassName("treeaddress")[i].value != "undefined"){
        document.getElementsByClassName("treeaddress")[i].value = treeaddress;
      }
      else{
        document.getElementsByClassName("treetype")[i].innerHTML = treeaddress;
      }
      if(typeof document.getElementsByClassName("treetype")[i].value != "undefined"){
        document.getElementsByClassName("treetype")[i].value = treeaddress;
      }
      else{
        document.getElementsByClassName("treetype")[i].innerHTML = treeaddress;
      }
      if(typeof document.getElementsByClassName("latin")[i].value != "undefined"){
        document.getElementsByClassName("latin")[i].value = treeaddress;
      }
      else{
        document.getElementsByClassName("latin")[i].innerHTML = treeaddress;
      }
      if(typeof document.getElementsByClassName("bday")[i].value != "undefined"){
        document.getElementsByClassName("bday")[i].value = treeaddress;
      }
      else{
        document.getElementsByClassName("bday")[i].innerHTML = treeaddress;
      }
    }
  }, 500);
}
function cancelWindow(){
  TINY.box.hide();
}
function makeAdopt(){
  if(document.getElementsByClassName("commit")[1].checked){
    document.getElementsByTagName("form")[1].submit();
  }
  else{
    alert("Please approve your commitment and the city's disclaimer before adopting.");
  }
}