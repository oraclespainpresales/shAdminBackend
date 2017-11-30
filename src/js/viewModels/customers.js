define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'promise', 'ojs/ojtable', 'ojs/ojarraytabledatasource'],
 function(oj, ko, $) {
  
    function CustomerViewModel() {
      var self = this;
      var deptArray = [{DepartmentId: 1001, DepartmentName: 'ADFPM 1001 neverending', LocationId: 200, ManagerId: 300},
        {DepartmentId: 556, DepartmentName: 'BB', LocationId: 200, ManagerId: 300},
        {DepartmentId: 10, DepartmentName: 'Administration', LocationId: 200, ManagerId: 300},
        {DepartmentId: 20, DepartmentName: 'Marketing', LocationId: 200, ManagerId: 300},
        {DepartmentId: 30, DepartmentName: 'Purchasing', LocationId: 200, ManagerId: 300},
        {DepartmentId: 40, DepartmentName: 'Human Resources1', LocationId: 200, ManagerId: 300},
        {DepartmentId: 50, DepartmentName: 'Administration2', LocationId: 200, ManagerId: 300}];
      self.datasource = new oj.ArrayTableDataSource(deptArray, {idAttribute: 'DepartmentId'});

            self.currentRowListener = function (event, ui) {
console.log(ui.currentRow);
                var newCurrentRow = ui.currentRow;
console.log(newCurrentRow['rowIndex']);
document.getElementById("selectedDepartmentName").innerHTML = "asdasd";
document.getElementById("selectedDepartmentId").innerHTML = newCurrentRow['rowIndex'];
                self.datasource.at(newCurrentRow['rowIndex']).
                        then(function (rowObj) {
                            var obj = rowObj['data'];
                            $('#selectedDepartmentId').text(obj.DepartmentId);
                            $('#selectedDepartmentName').text(obj.DepartmentName);
                        });
            };

    }

    self.selectionListener = function (event, data) {
console.log(data['option']);
        if (data['option'] == 'selection')
        {
            var eventTxt = "Triggered ojoptionchange event for selection: \n";
            var selectionObj = data['value'];
            
            if (selectionObj == null)
            {
                var currentTxt = $('#selectionEventLog').val();
                currentTxt = currentTxt == null ? '' : currentTxt; 
                $('#selectionEventLog').val(eventTxt + "Selection is null \n" + currentTxt);
                return;
            }
            var i = 0;
            for (i = 0; i < selectionObj.length; i++)
            {
                var range = selectionObj[i];
                var startIndex = range.startIndex;
                var endIndex = range.endIndex;
                var startKey = range.startKey;
                var endKey = range.endKey;

                if (startIndex != null && startIndex.row != null)
                {
                    //row selection
                    eventTxt = eventTxt + "Row Selection\n";
                    eventTxt = eventTxt + "start row index: " + startIndex.row + ", end row index: " + endIndex.row + "\n";
                }
                if (startKey != null && startKey.row != null)
                {
                    eventTxt = eventTxt + "start row key: " + startKey.row + ", end row key: " + endKey.row + "\n";
                }

                if (startIndex != null && startIndex.column != null)
                {
                    //column selection
                    eventTxt = eventTxt + "Column Selection\n";
                    eventTxt = eventTxt + "start column index: " + startIndex.column + ", end column index: " + endIndex.column + "\n";
                }
                if (startKey != null && startKey.column != null)
                {
                    eventTxt =eventTxt + "start column key: " + startKey.column + ", end column key: " + endKey.column + "\n";
                }
            }
            var currentTxt = $('#selectionEventLog').val();
            currentTxt = currentTxt == null ? '' : currentTxt; 
            $('#selectionEventLog').val(eventTxt + "\n" + currentTxt);
        }
    };

    return new CustomerViewModel();
  }
);
