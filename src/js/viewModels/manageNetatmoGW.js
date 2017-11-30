define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'promise', 'ojs/ojtable', 'ojs/ojarraytabledatasource', 'ojs/ojbutton'],
 function(oj, ko, $) {
  
    function ManageNetatmoGWViewModel() {
console.log("aaaa"); 
      var self = this;
      var demozoneArray = [];
      var selectedDZ="";
      var rowIndex="";
      var dmz_url = "http://new.proxy.digitalpracticespain.com:9997";
      var ngw_url = "http://new.proxy.digitalpracticespain.com:11000";

      self.showMainTable = ko.observable(false);
      self.showDetails = ko.observable(false);
      self.showBack = ko.observable(false);
      self.showStart = ko.observable(false);
      self.showStop = ko.observable(false);
      self.actionOutput = ko.observable();
      self.actionOutput(' ');

      // Populate Array used as datasource for the html table
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.open("GET", dmz_url + "/ords/pdb1/smarthospitality/demozone/zone", false);
      //Get Demozone info
      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          var xmlhttp_response = JSON.parse(xmlhttp.responseText);
          var dzResp = xmlhttp_response.items;
          for (i = 0; i < dzResp.length; i++) {
            demozoneArray.push({id: dzResp[i].id, 
                                name:dzResp[i].name, 
                                baseport: dzResp[i].baseport, 
                                status: '', 
                                interval: 0, 
                                startedAt: null, 
                                period: 0, 
                                netatmo_status: '', 
                                netatmo_msg: ''});
          }
        }
      };
      xmlhttp.send();
      demozoneArray.push({id: '', name: '', baseport: '', status: '', interval: '', startedAt: null, period: '', netatmo_status: '', netatmo_msg: ''});

      // Make the data observable to allow dynamically updates on the table
      self.ObservableDemozoneArray = ko.observableArray(demozoneArray);
      // Populate Datasource in the html table
      self.datasource = new oj.ArrayTableDataSource(self.ObservableDemozoneArray, {idAttribute: 'id'});

      //Refresh status of Netatmo devices
      function updateDemoZones(fullReload) {
        var xmlhttp2 = new XMLHttpRequest();
        //Get status info
        //xmlhttp2.open("GET", ngw_url + "/ngw/admin/status", true);
        xmlhttp2.open("GET", ngw_url + "/ngw/admin/status", false);
        xmlhttp2.onreadystatechange = function () {
          if (xmlhttp2.readyState === 4 && xmlhttp2.status === 200) {
            var demozones2 = JSON.parse(xmlhttp2.responseText);
            for (i = 0; i < demozones2.length; i++) {
              var objIndex = demozoneArray.findIndex((obj => obj.id == demozones2[i].demozone));
              //Check if demozone exists in demozone array
              if (objIndex < 0) {
                console.log("manageNetatmoGW::updateDemoZones: demozone not found in the array.");
              } else {
                demozoneArray[objIndex].status = demozones2[i].loop.status;
                demozoneArray[objIndex].netatmo_status = demozones2[i].netatmo.status;
                demozoneArray[objIndex].netatmo_msg = demozones2[i].netatmo.message;
                demozoneArray[objIndex].interval = 0;
                demozoneArray[objIndex].startedAt = null;
                demozoneArray[objIndex].period = 0; 
                if (demozoneArray[objIndex].status == 'ON') {
                  demozoneArray[objIndex].interval = demozones2[i].loop.interval;
                  demozoneArray[objIndex].startedAt = new Date(demozones2[i].timer.startedAt);
                  demozoneArray[objIndex].period = demozones2[i].timer.period;
                }
                if (fullReload || (rowIndex == objIndex)) {
                  console.log("update of row: " + objIndex);
                  self.ObservableDemozoneArray.splice(objIndex, 1, demozoneArray[objIndex]);
                }
              }  
            }
          }
        };
        xmlhttp2.send();
      };

      updateDemoZones(true);

      // Make visible the table once loaded
      self.showMainTable(true);
      self.showBack(false);
      self.showStart(false);
      self.showStop(false);
      self.showDetails(false);

      // Listener event for the row selection
      // If the user clicks a demozone, then display the DemoZone on screen
      self.currentRowListener = function (event, ui) {
        var newCurrentRow = ui.currentRow;
console.log("Call to currentRowListener");
	rowIndex = newCurrentRow['rowIndex'];
        selectedDZ = demozoneArray[rowIndex].id;
        //selectedDZ = newCurrentRow['rowKey'];
console.log("selectedDZ: " + selectedDZ); 
console.log("rowIndex: " + rowIndex); 
        showDetails(rowIndex);
      }

      function showDetails(currentRow) { 
        //console.log("called showDetails for currentRow: " + currentRow);
        self.showMainTable(false);
        self.showDetails(true);
	self.showBack(true);
        self.showStart(false);
        self.showStop(false);
      
        document.getElementById("demozone_id").innerHTML = 'Demozone ID: ' + demozoneArray[currentRow].id;
        document.getElementById("demozone_name").innerHTML = 'Name: ' + demozoneArray[currentRow].name;
        document.getElementById("demozone_baseport").innerHTML = 'Base Port: ' + demozoneArray[currentRow].baseport;
        document.getElementById("demozone_status").innerHTML = 'Status: ' + demozoneArray[currentRow].status;
        document.getElementById("demozone_netatmo_status").innerHTML = 'Netatmo device status: ' + demozoneArray[currentRow].netatmo_status;
        document.getElementById("demozone_netatmo_msg").innerHTML = 'Netatmo device message: ' + demozoneArray[currentRow].netatmo_msg;
        if (demozoneArray[currentRow].status == 'ON') {
          document.getElementById("demozone_interval").innerHTML = 'Interval of messages (in seconds): ' + demozoneArray[currentRow].interval;
          document.getElementById("demozone_starttime").innerHTML = 'Start Time: ' + demozoneArray[currentRow].startedAt;
          document.getElementById("demozone_period").innerHTML = 'Duration of the process since started (in minutes): ' + demozoneArray[currentRow].period;
          self.showStop(true);
        } else if (demozoneArray[currentRow].status == 'OFF') {
          document.getElementById("demozone_interval").innerHTML = 'Interval of messages (in seconds): --';
          document.getElementById("demozone_starttime").innerHTML = 'Start Time (UTC): --';
          document.getElementById("demozone_period").innerHTML = 'Period in which it will be active since started (in minutes): -- ';
          self.showStart(true);
        } else if (demozoneArray[currentRow].status == 'ERROR') {
          document.getElementById("demozone_interval").innerHTML = 'Interval of messages (in seconds): Not Reachable';
          document.getElementById("demozone_starttime").innerHTML = 'Start Time (UTC): Not Reachable';
          document.getElementById("demozone_period").innerHTML = 'Period in which it will be active since started (in minutes): Not Reachable';
        }
      };


      self.backToTable = function (data, event) {
        console.log("call to backToTable");
        resetValues();
      };

      function resetValues() {
        self.showMainTable(true);
        self.showDetails(false);
        self.actionOutput(' ');
        document.getElementById('new_temperature').value='';
        document.getElementById('input_interval').value='';
        selectedDZ="";
        rowIndex="";
      };


      self.startDemozone = function (data, event) {
        console.log("call to start timer demozone");
        var interval = document.getElementById('input_interval').value;
        //Check if interval is a valid number	
        if (isNaN(parseFloat(interval))) {
          interval = 1;
        }
        self.actionOutput('Starting Netatmo timer for this demozone, for ' + interval + ' minutes.');
        //console.log("calling: " + ngw_url + "/ngw/admin/start/" + selectedDZ + "/" + interval);
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("POST", ngw_url + "/ngw/admin/start/" + selectedDZ + "/" + interval, false);
        xmlhttp.onreadystatechange = function () {
          console.log("xmlhttp.status: " + xmlhttp.status);
          console.log("xmlhttp.readyState: " + xmlhttp.readyState);
          if ((xmlhttp.readyState === 4 && xmlhttp.status === 200)||(xmlhttp.readyState === 4 && xmlhttp.status === 204)) {
            //Update Demozones table
            updateDemoZones(false);
            resetValues();
          }
        };
        //xmlhttp.send(JSON.stringify(newComment));
        xmlhttp.send();
      };


      self.stopDemozone = function (data, event) {
        console.log("call to stop timer demozone");
        self.actionOutput('Stopping Netatmo timer for this demozone.');

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("POST", ngw_url + "/ngw/admin/stop/" + selectedDZ, false);
        xmlhttp.onreadystatechange = function () {
          console.log("xmlhttp.status: " + xmlhttp.status);
          console.log("xmlhttp.readyState: " + xmlhttp.readyState);
          if ((xmlhttp.readyState === 4 && xmlhttp.status === 200)||(xmlhttp.readyState === 4 && xmlhttp.status === 204)) {
            //Update Demozones table
            updateDemoZones(false);
            resetValues();
          }
        };
        xmlhttp.send();
      };


      self.changeDemozoneTemp = function (data, event) {
        console.log("call to change Demozone temp");
        var temperature = document.getElementById('new_temperature').value;
        if (isNaN(parseFloat(temperature))) {
           self.actionOutput(temperature + ' is not valid value for temperature. Change the value and try again.');
        } else if ((temperature<1)||(temperature>35)) {
           self.actionOutput(temperature + ' is not valid value for temperature. Change the value and try again.');
        } else {
           var xmlhttp = new XMLHttpRequest();
           xmlhttp.open("POST", ngw_url + "/ngw/admin/set/" + selectedDZ + "/" + temperature, false);
           xmlhttp.onreadystatechange = function () {
             console.log("xmlhttp.status: " + xmlhttp.status);
             console.log("xmlhttp.readyState: " + xmlhttp.readyState);
             if ((xmlhttp.readyState === 4 && xmlhttp.status === 200)||(xmlhttp.readyState === 4 && xmlhttp.status === 204)) {
               //var xmlhttp_response = JSON.parse(xmlhttp.responseText);
               self.actionOutput(xmlhttp.responseText);
             }
           };
           xmlhttp.send();
        }
      };


    }

    /*
     * Returns a constructor for the ViewModel so that the ViewModel is constrcuted
     * each time the view is displayed.  Return an instance of the ViewModel if
     * only one instance of the ViewModel is needed.
     */
    return new ManageNetatmoGWViewModel();
  }
);
