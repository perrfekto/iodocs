function addRow (obj, nmItem, numEl) {
  var pre = nmItem + '[' + numEl + ']';
  var parent = nmItem.split('.').pop();
  if (obj.hasOwnProperty ('Name')) {
    var name = obj.Name;
  }
  else {
    var name = '';
  }

  var trStr = '<tr id="' + pre + '" data-item="' + nmItem;
  if (obj.hasOwnProperty ('Required') && obj.Required.toLowerCase() == 'y') {
    trStr += ' class="required"';
  }
  trStr += '>';
  
  trStr += '<td class="name">' + name + '</td>';

  trStr += '<td class="parameter">';
  if (obj.hasOwnProperty ('Type')) {
    var typ = obj.Type.toLowerCase();
  }
  else {
    var typ = 'string';
  }

  // TODO: Boolean type and default values
  if (typ == 'enumerated') {
    trStr += '<select name="reqbody[' + parent + '][' + numEl + '][' + name + ']>';
    if (!obj.hasOwnProperty ('Default') || obj.Default =='') {
      trStr += '<option value=""></option>';
    }

    var numOp = obj.EnumeratedList.length;
    for (var i = 0; i < numOp; i++) {
      trStr += '<option value="obj.EnumeratedList[i]"'
      if (obj.EnumeratedList[i] == def) {
        trStr += ' selected="true"';
      }
      trStr += '>' + obj.EnumeratedList[i] + '</option>';
    }
  }

  else if (typ == 'textarea') {
    trStr += '<textarea name="reqbody[' + parent + '][' + numEl + '][' + name + '] cols="40" rows="3"/>';
  }

  // TODO: dataRow and update of json
  else if (typ == 'array') {
    trStr += '<a data-item="' + nmItem + '[' + numEl + '] data-row="0", data-num="0" class="addItems">++</a>';
  }
      
  else {     
    trStr += '<input name="reqbody[' + parent + '][' + numEl + '][' + name + ']"/>';
  }
  trStr += '<td>';

  trStr += '<td class="type">' + typ + '</td>';
  trStr += '<td class="description"><p>';
  if (obj.hasOwnProperty ('Description')) {
    trStr += obj.Description;
  }
  trStr += '</p></td>';

  trStr += '</tr>';
  return trStr;
}

(function() {
  var jsStr = $('#p_json').text();
  if (jsStr != '') {
    var typesArray = JSON.parse (jsStr);
  }

  $('a.addItems').live('click', function() {
    var nmItem = $(this).attr('data-item');
    var numEl = $(this).attr('data-num');
    var rowNum = $(this).attr('data-row');
    var trStr = '';

    if (typesArray[nmItem]) {
      var len = typesArray[nmItem].length;

      for (var i = 0; i < len; i++) {
        trStr += addRow (typesArray[nmItem][i], nmItem, parseInt(numEl) + i);
      }
    }

    var a = nmItem.split('.');
    a.pop();
    var tblName = 'tbl.' + a.join('.') + '.body';
    $('#tbl.Members.Test.body > tbody:last').append (trStr);
//    alert (trStr);
    
  });
})();

