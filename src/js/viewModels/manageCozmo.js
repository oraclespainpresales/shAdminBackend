define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'promise', 'ojs/ojselectcombobox', 'ojs/ojbutton'],
 function(oj, ko, $) {
  
    function ManageCozmoViewModel() {

      var self = this;
      self.showDemozoneSelection = ko.observable(true);
      self.showCozmoActions = ko.observable(false);
      self.showCozmoOutputActions = ko.observable(false);
      self.showSelectedDemozone = ko.observable(false);
      self.zone = ko.observable();
      self.zoneList = ko.observableArray([]);
      $('#selectedDemozone').text('');
      self.actionOutput = ko.observable();
      self.actionOutput(' ');

      self.startButtonClick = function(data, event){
        $('#selectedDemozone').text(self.zone());
        self.showDemozoneSelection(false);
        self.showCozmoActions(true);
        self.showCozmoOutputActions(true);
        self.showSelectedDemozone(true);
        self.actionOutput(' ');
        return true;
      }

      self.backToDemozoneSelection = function (data, event) {
        self.showDemozoneSelection(true);
        self.showCozmoActions(false);
        self.showCozmoOutputActions(false);
        self.showSelectedDemozone(false);
        document.getElementById('selectedDemozone').text='';
        self.actionOutput(' ');
      };

      $.ajax(
          {  type: "GET",
             url:  "http://new.proxy.digitalpracticespain.com:9997/ords/pdb1/smarthospitality/demozone/zone",
             crossDomain : true,
             dataType : "json",
             success: function (data) {
               var list = [];
               data.items.forEach(function(z) {
                      list[list.length] = {value: (z.id), label: z.name };
               });

               self.zoneList(list);
               if (list.length>0) self.zone([list[0].value]);
             },
             error: function (msg, url, line) {
             }
         });

      var dmz_url = "http://new.soa.digitalpracticespain.com";

      self.onCozmoAction = function (data, event) {
        self.actionOutput(' ');
        console.log("**** Cleaned output!!!! ****");
        var dz = self.zone().toString();
        var dzLower = dz.toLowerCase();
        //var svc_url = dmz_url + "/SH_Gadgets_Helper/SendCozmoService/devices/COZMO";
        var svc_url = dmz_url + "/SH_Gadgets_Helper/SendCozmoService/devices/execute/COZMO?demozone=" + dz;
        var post_msg="";
        var actionStr = event.currentTarget.id.toString();
        switch(actionStr) {
          case 'reset':
            svc_url = dmz_url + "/admin/server/" + dzLower + "/kioskin/cozmo/restart"; 
            break;
          case 'lightCube1':
            //post_msg = {'demozone':dz,'op':'ON1'}; 
            svc_url = svc_url + "&op=ON1";
            break;
          case 'lightCube2':
            //post_msg = {'demozone':dz,'op':'ON2'}; 
            svc_url = svc_url + "&op=ON2";
            break;
          case 'lightCube3':
            //post_msg = {'demozone':dz,'op':'ON3'}; 
            svc_url = svc_url + "&op=ON3";
            break;
          case 'switchOffCubes':
            //post_msg = {'demozone':dz,'op':'OFF'}; 
            svc_url = svc_url + "&op=OFF";
            break;
          case 'simRoomService':
            //post_msg = {'demozone':dz,'op':'SERVICE','params':{'room':201,'service':'Hamburguer Menu'}}; 
            break;
          case 'simIncident':
            //post_msg = {'demozone':dz,'op':'MAINTENANCE'}; 
            break;
        }
        console.log("event.currentTarget.id: " + event.currentTarget.id);
        console.log("Service URL: " + svc_url);
        console.log("Data POST: " + JSON.parse(JSON.stringify(post_msg)).toString());
        var xmlhttp = new XMLHttpRequest();
        if (actionStr != "reset") {
          xmlhttp.open("GET", svc_url, false);
        } else {
          xmlhttp.open("POST", svc_url, false);
        }
        //xmlhttp.setRequestHeader("cache-control", "no-cache");
        xmlhttp.onreadystatechange = function () {
          console.log("xmlhttp.status: " + xmlhttp.status);
          console.log("xmlhttp.readyState: " + xmlhttp.readyState);
          if ((xmlhttp.readyState === 4 && xmlhttp.status === 200)||(xmlhttp.readyState === 4 && xmlhttp.status === 204)) {
            //var xmlhttp_response = JSON.parse(xmlhttp.responseText);
            self.actionOutput(xmlhttp.responseText);
          }
        };
        if (post_msg != "") {
          xmlhttp.setRequestHeader("content-type", "application/json;charset=UTF-8");
          xmlhttp.send(JSON.stringify(post_msg));
        } else {
          xmlhttp.send();
        }
      };

    }

    /*
     * Returns a constructor for the ViewModel so that the ViewModel is constrcuted
     * each time the view is displayed.  Return an instance of the ViewModel if
     * only one instance of the ViewModel is needed.
     */
    return new ManageCozmoViewModel();
  }
);
