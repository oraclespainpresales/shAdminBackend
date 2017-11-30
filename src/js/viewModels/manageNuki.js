define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'promise', 'ojs/ojselectcombobox', 'ojs/ojbutton'],
  function(oj, ko, $) {
  
    function ManageNukiViewModel() {

      var self = this;
      self.showDemozoneSelection = ko.observable(true);
      self.showNukiActions = ko.observable(false);
      self.showNukiOutputActions = ko.observable(false);
      self.showSelectedDemozone = ko.observable(false);
      self.zone = ko.observable();
      self.zoneList = ko.observableArray([]);
      $('#selectedDemozone').text('');
      self.actionOutput = ko.observable();
      self.actionOutput(' ');
      self.currentNgrok = ko.observable();
      self.currentNgrok('');
      self.enableOpenDoor = ko.observable(false);
      currentNgrokValue = '';

      self.startButtonClick = function(data, event){
        $('#selectedDemozone').text(self.zone());
        self.showDemozoneSelection(false);
        self.showNukiActions(true);
        self.showNukiOutputActions(true);
        self.showSelectedDemozone(true);
        self.actionOutput(' ');
        self.enableOpenDoor(false);
    
        return true;
      }

      self.backToDemozoneSelection = function (data, event) {
        self.showDemozoneSelection(true);
        self.showNukiActions(false);
        self.showNukiOutputActions(false);
        self.showSelectedDemozone(false);
        document.getElementById('selectedDemozone').text='';
        self.actionOutput(' ');
        self.currentNgrok('');
        self.enableOpenDoor(false);
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

      self.refreshNgrok = function (data, event) {
        var dzLower = self.zone().toString().toLowerCase();
        var svc_url = "http://new.proxy.digitalpracticespain.com:9997/ords/pdb1/smarthospitality/ngrok/get/" + dzLower + "/nuc/gateway"; 
        console.log("event.currentTarget.id: " + event.currentTarget.id);
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", svc_url, false);
        xmlhttp.setRequestHeader("cache-control", "no-cache");
        xmlhttp.onreadystatechange = function () {
          if ((xmlhttp.readyState === 4 && xmlhttp.status === 200)||(xmlhttp.readyState === 4 && xmlhttp.status === 204)) {
            //var xmlhttp_response = JSON.parse(xmlhttp.responseText).urlhttp;
            currentNgrokValue = JSON.parse(xmlhttp.responseText).urlhttp;
            self.currentNgrok(currentNgrokValue);
            self.enableOpenDoor(true);
            enableOpenDoor = true;
          }
        };
        xmlhttp.send();
      };

      self.onNukiAction = function (data, event) {
        var dzLower = self.zone().toString().toLowerCase();
        var svc_url = "";
        var actionStr = event.currentTarget.id.toString();
        switch(actionStr) {
          case 'openDoor':
            svc_url = currentNgrokValue + "/UNLATCH"; 
            console.log("***************svc_url: " + svc_url);
            break;
        }
        console.log("event.currentTarget.id: " + event.currentTarget.id);
        console.log("Service URL: " + svc_url);
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", svc_url, false);
        xmlhttp.setRequestHeader("cache-control", "no-cache");
        xmlhttp.onreadystatechange = function () {
          console.log("xmlhttp.status: " + xmlhttp.status);
          console.log("xmlhttp.readyState: " + xmlhttp.readyState);
          if ((xmlhttp.readyState === 4 && xmlhttp.status === 200)||(xmlhttp.readyState === 4 && xmlhttp.status === 204)) {
            //var xmlhttp_response = JSON.parse(xmlhttp.responseText);
            self.actionOutput(xmlhttp.responseText);
          }
        };
        xmlhttp.send();
      };

    }

    /*
     * Returns a constructor for the ViewModel so that the ViewModel is constrcuted
     * each time the view is displayed.  Return an instance of the ViewModel if
     * only one instance of the ViewModel is needed.
     */
    return new ManageNukiViewModel();
  }
);
