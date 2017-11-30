define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'promise', 'ojs/ojinputtext', 'ojs/ojinputnumber', 'ojs/ojtable', 'ojs/ojselectcombobox', 'ojs/ojarraytabledatasource'],
  function(oj, ko, $) {

    self.demoZoneSelected = ko.observable();
    self.zoneList = ko.observableArray([]);

    $.ajax({
        type: "GET",
        url:  "http://new.proxy.digitalpracticespain.com:9997/ords/pdb1/smarthospitality/demozone/zone",
        crossDomain : true,
        dataType : "json",
        success: function (data) {
          var list = [];
          data.items.forEach(function(z) {
            list[list.length] = {value: (z.id), label: z.name };
          });
          self.zoneList(list);
          if (list.length>0) self.demoZoneSelected([list[0].value]);
        },
        error: function (msg, url, line) {}
    });
  
    function loadCurrentSims() {
      var localSimArray = [];
      var sim_url = "http://new.proxy.digitalpracticespain.com:9009";
      //var sim_url = "http://129.157.236.187:9009";
      // Populate Array used as datasource for the html table
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.open("GET", sim_url + "/iotsims/admin/status", false);
      //Get IoT Simulators info
      console.log("### reloading sims... ###");
      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          var xmlhttp_response = JSON.parse(xmlhttp.responseText);
          var simulators = xmlhttp_response;
          for (i = 0; i < simulators.length; i++) {
            /*if (simulators[i].procStatus != 1) {
              self.imgClass=ko.observable('oj-fwk-icon-status-error');
            } else {
              self.imgClass=ko.observable('oj-fwk-icon-status-confirmation');
            }*/
            localSimArray.push({
			'demoZone': simulators[i].demoZone, 
			'hotelName': simulators[i].hotelName,
			'roomNumber': (simulators[i].listenPort - 9000), 
			'listenPort': simulators[i].listenPort, 
			'procStatus': simulators[i].procStatus, 
			'procId': simulators[i].procId, 
			'startedAt': simulators[i].startedAt,
			'folderName': simulators[i].folderName,
                        'urlToSim': 'http://new.proxy.digitalpracticespain.com:'+simulators[i].listenPort});
          }
        }
      };
      xmlhttp.send();
      return localSimArray;
    }

    function actionOnExistingSimulator(action, listenPort) {
      var sim_url = "http://new.proxy.digitalpracticespain.com:9009";
      //var sim_url = "http://129.157.236.187:9009";
      // Populate Array used as datasource for the html table
      var xmlhttp = new XMLHttpRequest();
      var response;
      xmlhttp.open("GET", sim_url + "/iotsims/admin/" + action + "/" + listenPort, false);
      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          //var xmlhttp_response = JSON.parse(xmlhttp.responseText);
          response = xmlhttp.responseText;
        }
      };
      xmlhttp.send();
      return response;
    }

    function submitSimulatorCreation(demoZone, hotelName, roomNumber, roomType) {
      var sim_url = "http://new.proxy.digitalpracticespain.com:9009";
      //var sim_url = "http://129.157.236.187:9009";
      // Populate Array used as datasource for the html table
      var xmlhttp = new XMLHttpRequest();
      var response;
      console.log(sim_url + "/iotsims/admin/create/" + demoZone + "/" + hotelName + "/" + roomNumber + "/" + roomType);
      xmlhttp.open("GET", sim_url + "/iotsims/admin/create/" + demoZone + "/" + hotelName + "/" + roomNumber + "/" + roomType, false);
      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          //var xmlhttp_response = JSON.parse(xmlhttp.responseText);
          response = xmlhttp.responseText;
        }
      };
      xmlhttp.send();
      return response;
    }

    function IotsimulatorsViewModel() {
      var self = this;
      var simArray = [];
      var currentRow;

      //Populate table
      simArray = loadCurrentSims();
      self.simsObservableArray = ko.observableArray(simArray);
      self.datasource = new oj.ArrayTableDataSource(self.simsObservableArray, {idAttribute: 'listenPort'});
    
      //add to the observableArray
      self.createSimulator = function()
      {
         console.log("Requesting the creation of a new simulator.");

         var resp = submitSimulatorCreation(self.inputDemoZone(), self.inputHotelName(), self.inputRoomNumber(), self.inputRoomType());
         self.actionOutput(resp);
         /* var newSim = {
			'demoZone': self.inputDemoZone(), 
			'hotelName': self.inputHotelName(),
			'roomNumber': self.inputRoomNumber(), 
			'listenPort': listenPort, 
			'procStatus': 'OFF', 
			'procId': 'N/A', 
			'startedAt': 'N/A',
			'folderName': self.inputDemoZone() + '_' + self.inputHotelName() + '_atPort_' + listenPort};
         self.simsObservableArray.push(newSim); */

         // Refresh page
         self.inputDemoZone('');
         self.inputHotelName('');
         self.inputRoomNumber(null);
         self.inputRoomType(' ');
      };

 
      //used to start-stop-delete the simulator represented by the selected row.
      self.onActionSimulator = function(data, event)
      {
        //var currentRow = $('#simtable').ojTable('option', 'currentRow');
        if (currentRow != null)
        {
            console.log("Start Simulator listening on: "+currentRow['rowKey']);
            var resp = actionOnExistingSimulator(event.currentTarget.id, currentRow['rowKey']);
            self.actionOutput(resp);
            /* self.simsObservableArray.splice(currentRow['rowIndex'], 1, {
                         'DepartmentId': self.inputDepartmentId(),
                         'DepartmentName': self.inputDepartmentName(),
                         'LocationId': self.inputLocationId(),
                         'ManagerId': self.inputManagerId()
                      }); */
        } else {
            console.log("self.changeStatus.currentRow: NULL");
        }
        self.refreshTable();
      };
    
      //used to refresh the table 
      self.cleanOutput = function()
      {
	self.actionOutput(' ');
      };


      //used to refresh the table 
      self.refreshTable = function()
      {
        var simArray2 = [];
        simArray2 = loadCurrentSims();
	console.log("Cleaning table of size: " + self.simsObservableArray().length);
        self.simsObservableArray.splice(0, self.simsObservableArray().length);

	//$('#simtable').ojtable( "refresh" ************************************);
	$('#selectedSimulator').text('');
	$('#simulatorLink').text('');
        //self.enableOpenSim(false);

	console.log("Refilling with new items: " + simArray2.length);
        for (i = 0; i < simArray2.length; i++) {
 	  console.log("Refilling table element: " + i);
          self.simsObservableArray.push(simArray2[i]);
        }
      };

      //intialize the observable values in the forms
      self.inputDemoZone = ko.observable();
      self.inputHotelName = ko.observable();
      self.inputRoomNumber = ko.observable();
      self.inputRoomType = ko.observable();
      self.actionOutput = ko.observable();
      //self.imgClass=ko.observable();
      //self.enableOpenSim = ko.observable(false);
      //self.urlOfSelectedSim = ko.observable();


      self.currentRowListener = function (event, ui) {
         currentRow = ui.currentRow;
	 $('#selectedSimulator').text('');
	 $('#simulatorLink').text('');
         self.datasource.at(currentRow['rowIndex']).then(function (rowObj) {
            var obj = rowObj['data'];
            $('#selectedSimulator').text("DemoZone: " + obj.demoZone + "; Hotel: " + obj.hotelName + "; Room: " + obj.roomNumber);
            $('#simulatorLink').text(obj.urlToSim);
            $('#simulatorLink').click(function() { window.open(obj.urlToSim, '_blank'); });
            //$('#simulatorLink').click( window.open(obj.urlToSim, '_blank'));
            //self.urlOfSelectedSim(obj.urlToSim);
            //self.enableOpenSim(true);
            //$('.fatherDiv').on('click','.childDiv', {} ,function(e){});
         });

         /*if (ui['option'] == 'currentRow' && ui['value'] != null) {
            console.log("currentRowListener identifies the ROW!!!!");
            var rowIndex = ui['value']['rowIndex'];
            console.log("and the selected ROW is: " + rowIndex);
            var currSim = self.simsObservableArray()[rowIndex];
            self.inputDemoZone(currSim['demoZone']);
            self.inputHotelName(currSim['hotelName']);
            self.inputRoomNumber(currSim['roomNumber']);
         } else {
            console.log("currentRowListener does not identify the ROW!!!!");
         }*/
         /*self.showMainTable(false);
         self.showDetails(true);
         var newCurrentRow = ui.currentRow;
         console.log(newCurrentRow);
         self.datasource.at(newCurrentRow['rowIndex']).then(function (rowObj) {
                            var obj = rowObj['data'];
                            $('#selectedDepartmentId').text(obj.DepartmentId);
                            $('#selectedDepartmentName').text(obj.DepartmentName);
         });*/
      };



    }

    return new IotsimulatorsViewModel();
  }
);
