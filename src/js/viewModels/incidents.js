define(['ojs/ojcore', 'knockout', 'ojs/ojknockout', 'ojs/ojtable'],
 function(oj, ko) {
 
    function IncidentsViewModel() {
      var self = this;
      self.showMainTable = ko.observable(true); 
      self.showDetails = ko.observable(false); 

      var deptArray = [
        {DepartmentId: 20, DepartmentName: 'History', LocationId: 200, ManagerId: 300},
        {DepartmentId: 10, DepartmentName: 'Geography', LocationId: 200, ManagerId: 300},
        {DepartmentId: 30, DepartmentName: 'Biology', LocationId: 200, ManagerId: 300}];
      self.datasource = new oj.ArrayTableDataSource(deptArray, {idAttribute: 'DepartmentId'});

      self.tableListener = function (data, event) {
        self.showMainTable(false);
        self.showDetails(true);
      };

      self.toggleTable = function (data, event) {
        self.showMainTable(true);
        self.showDetails(false);
      };
    


            self.currentRowListener = function (ui, event) {
           self.showMainTable(false);
           self.showDetails(true);
                var newCurrentRow = ui.currentRow;
console.log(newCurrentRow);
                self.datasource.at(newCurrentRow['rowIndex']).
                        then(function (rowObj) {
                            var obj = rowObj['data'];
                            $('#selectedDepartmentId').text(obj.DepartmentId);
                            $('#selectedDepartmentName').text(obj.DepartmentName);
                        });
            };



    }
    return new IncidentsViewModel();
  }
);



