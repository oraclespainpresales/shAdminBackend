define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojselectcombobox', 'ojs/ojbutton'],
 function(oj, ko, $) {
  
    function KkViewModel() {

      self.startButtonClick = function(data, event){
        //kk2.initSocket(self.zone());
        //oj.Router.rootInstance.go('dashboard');
        return true;
      }

      self.zone = ko.observable();
      self.zoneList = ko.observableArray([]);


                $.ajax(
                    {
                       type: "GET",
                       url:  "http://new.proxy.digitalpracticespain.com:9997/ords/pdb1/smarthospitality/demozone/zone",
                       crossDomain : true,
                       dataType : "json",
                       success: function (data) {
                        var list = [];

                        data.items.forEach(function(z) {
                                //if (z.active === 'Y') list[list.length] = {value: (z.proxyport - 7700 + 10000), label: z.id };
                                list[list.length] = {value: (z.id), label: z.name };

                        });

                       self.zoneList(list);
                       if (list.length>0) self.zone([list[0].value]);
                       },
                       error: function (msg, url, line) {

                       }
                   });










    }

    return new KkViewModel();
  }
);
