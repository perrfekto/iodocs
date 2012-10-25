function addRow (obj, nameItem, numEl) {
  var pre = nameItem + '.' + numEl;
  var parent = nameItem.split('.').pop();
  if (obj.hasOwnProperty ('Name')) {
    var name = obj.Name;
  }
  else {
    var name = '';
  }

  var trStr = '<tr id="tr_' + pre + '.' + name + '" data-item="' + nameItem + '" class="indent1';
  if (obj.hasOwnProperty ('Required') && obj.Required.toLowerCase() == 'y') {
    trStr += ' required';
  }
  trStr += '">';
  
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
    trStr += '<a data-item="' + nameItem + '[' + numEl + ']" data-row="0", data-num="0" class="addItems">++</a>';
  }
      
  else {     
    trStr += '<input name="reqbody[' + parent + '][' + numEl + '][' + name + ']"/>';
  }
  trStr += '</td>';

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
    var nameItem = $(this).attr('data-item');
    var numEl = $(this).attr('data-num');
    var numItems = $(this).attr('data-numItems');
    var rowNum = parseInt ($(this).attr('data-row')) + (parseInt (numEl) * (parseInt (numItems) + 1)) - 1;
    var a = nameItem.split('.');
    var dispName = a.pop() + '[' + numEl + ']';
    var tblName = '#tbl\\.' + a.join('\\.') + '\\.body';

    // Add rows
    var trStr = '<tr id="tr_' + nameItem + '.' + numEl + 
      '." class="indent1head"><td id="td_' + nameItem + '.' + numEl + '.">' + dispName + 
      '</td><td><a id="a_' + nameItem + '.' + numEl + '." class="delItems" data-item="' + nameItem + '" data-seq="' + numEl + '">--</a></td><td></td><td></td></tr>';

    if (typesArray[nameItem]) {
      var len = typesArray[nameItem].length;

      for (var i = 0; i < len; i++) {
        trStr += addRow (typesArray[nameItem][i], nameItem, numEl);
      }
    }

    $(tblName + ' > tbody > tr').eq (rowNum).after(trStr);
    
    // Update buttons's data-num attribute
    $(this).attr ('data-num', parseInt (numEl) + 1);

  });


  $('a.delItems').live('click', function() {
    var nameItem = $(this).attr('data-item');
    var seq = $(this).attr('data-seq');
    var parent = nameItem.split('.').pop();

    // Remove the rows
    var sel = 'tr[id^="tr_' + nameItem.replace (/\./g, '\\.') + '\\.' + seq + '"]';
    $(sel).remove();

    sel = '#addItems\\.' + nameItem.replace (/\./g, '\\.');
    var numEl = $(sel).attr('data-num');
    $(sel).attr('data-num', (parseInt (numEl) - 1));

    // Update remaining rows' ids and form fields' names to reflect new seq

    seq = parseInt (seq);
    var repl = '';
    var tmp = '';
    var ii = 0;

    for (var i = seq + 1; i < parseInt (numEl); i++) {
      ii = parseInt (i) - 1;
      sel = '*[name^="reqbody[' + parent + '][' + i + ']"]';
      src = 'reqbody[' + parent + '][' + i + ']';
      repl = 'reqbody[' + parent + '][' + ii + ']';

      $(sel).each (function () {
        tmp = $(this).attr('name');
        tmp = tmp.replace (src, repl);
         
        $(this).attr('name', tmp);
      });


      sel = 'tr[id^="tr_' + nameItem.replace (/\./g, '\\.') + '\\.' + i + '\\."]';
      src = 'tr_' + nameItem + '.' + i + '.';
      repl = 'tr_' + nameItem + '.' + ii + '.';

      $(sel).each (function () {
        tmp = $(this).attr('id');
        tmp = tmp.replace (src, repl);
         
        $(this).attr('id', tmp);
      });


      sel = 'td[id^="td_' + nameItem.replace (/\./g, '\\.') + '\\.' + i + '\\."]';
      src = 'td_' + nameItem + '.' + i + '.';
      repl = 'td_' + nameItem + '.' + ii + '.';

      $(sel).each (function () {
        tmp = $(this).attr('id');
        tmp = tmp.replace (src, repl);
         
        $(this).attr('id', tmp);
        $(this).html(parent + '[' + ii + ']');
      });


      sel = 'a[id^="a_' + nameItem.replace (/\./g, '\\.') + '\\.' + i + '\\."]';
      src = 'a_' + nameItem + '.' + i + '.';
      repl = 'a_' + nameItem + '.' + ii + '.';
      $(sel).each (function () {
        tmp = $(this).attr('id');
        tmp = tmp.replace (src, repl);
         
        $(this).attr('id', tmp);
        $(this).attr('data-seq', ii);
      });
    }
  });

})();

