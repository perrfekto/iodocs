var typesArray;

function addRow (obj, idPre, namePre, nameItem, numEl, level, nxtRow, parentId) {
  if (obj.hasOwnProperty ('Name')) {
    var name = obj.Name;
  }
  else {
    var name = '';
  }

  var trStr = '<tr id="tr_' + idPre + '.' + name + '." class="indent' + level;
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
    trStr += '<select name="' + namePre + '[' + name + ']>';
    if (!obj.hasOwnProperty ('Default') || obj.Default =='') {
      trStr += '<option value=""></option>';
    }
  
    var numOp = obj.EnumeratedList.length;
    for (var i = 0; i < numOp; i++) {
      trStr += '<option value="obj.EnumeratedList[i]"';
      if (obj.EnumeratedList[i] == def) {
        trStr += ' selected="true"';
      }
      trStr += '>' + obj.EnumeratedList[i] + '</option>';
    }
  }

  else if (typ == 'textarea') {
    trStr += '<textarea name="' + namePre + '[' + name + '] cols="40" rows="3"/>';
  }

  else if (typ == 'array') {
    var numItems = 0;
    var idx = nameItem + '.' + name;
    if (typesArray[idx]) {
      numItems = typesArray[idx].length;
    }

    trStr += '<input type="button" value="+" id="addItems.' + idPre + '.' + name + '." data-item="' + idx + '" data-num="0" data-level="' + level + 
                '" data-numItems="' + numItems + '" data-nxtrow="' + nxtRow + '" data-parentid="' + parentId + '" class="addItems"/>';
  }

  else {
    trStr += '<input name="' + namePre + '[' + name + ']"/>';
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
    typesArray = JSON.parse (jsStr);
  }


  /**
    * addItems
    */
  $('table.parameters').on("click", ".addItems", function() {
    var id = $(this).attr('id');
    var nameItem = $(this).attr('data-item');
    var numEl = $(this).attr('data-num');
    var numItems = $(this).attr('data-numItems');
    var lastRow = parseInt ($(this).attr('data-nxtrow')) - 1;

    var a = id.split('.');
    a.shift();    // addItems
    a.pop();      // empty last
    var idPre = a.join('.') + '.' + numEl;

    var tmp = a.pop();
    var dispName = tmp + '[' + numEl + ']';
    var namePre = '[' + tmp + ']';

    var level = parseInt ($(this).attr('data-level'));
    for (var i = 1; i <= level; i++) {
      // column.index
      tmp = a.pop();
      namePre = '[' + tmp + ']' + namePre;
      tmp = a.pop();
      namePre = '[' + tmp + ']' + namePre;
    }
    namePre = 'reqbody' + namePre + '[' + numEl + ']';

    var tblName = '#tbl\\.' + a.join('\\.') + '\\.body';
    var topSel = 'addItems\\.' + a.join('\\.') + '\\.';
    level += 1;

    // Add rows
    var trStr = '<tr id="tr_' + idPre +
                '." class="indent' + level + 'head"><td id="td_' + idPre + '.">' + dispName +
                '</td><td><input type="button" value="-" id="delItems.' + idPre  + '." class="delItems" data-parentid="' + id + '" data-seq="' + numEl + '" data-level="' + level + '"/></a></td><td></td><td></td></tr>';

    if (typesArray[nameItem]) {
      var len = typesArray[nameItem].length;
      for (var i = 0; i < len; i++) {
        trStr += addRow (typesArray[nameItem][i], idPre, namePre, nameItem, numEl, level, lastRow + 1, id);  // 1 - original subtracted
      }
    }
    else {
      var len = 0;
    }

    $(tblName + ' > tbody > tr').eq (lastRow).after(trStr);
    
    // Update buttons's data-num attribute
    $(this).attr ('data-num', parseInt (numEl) + 1);


    // Update other array elements' nxtrow, i.e. parent other sib
    sel = '*[id^="' + topSel + '"]';

    var nn = 0;
    lastRow += 1;  // 1 - subtracted at beginning
    var chId = id + numEl + '.';
    var parId = $(this).attr('data-parentid');

    $(sel).each (function () {
      id = $(this).attr('id');
      nn = parseInt ($(this).attr('data-nxtrow'));

      if (nn > lastRow || 
         (nn == lastRow && (id.indexOf (chId) == 0 || id == parId))) {      // Child with array - adding on parent or last child
        $(this).attr ('data-nxtrow', nn + len + 1);  // 1 - header row
      }

    });
    
    // must do self after the rest
    $(this).attr ('data-nxtrow', lastRow + parseInt (numItems) + 1); // 1 - header row
  });
  
  
  /**
    * delItems
    */
  $('table.parameters').on("click", ".delItems", function() {
    var id = $(this).attr('id');
    var seq = $(this).attr('data-seq');
    var parentId = $(this).attr('data-parentid');

    var a = parentId.split('.');
    a.shift();      // addItems
    a.pop();        // empty end
    var parent = a.join ('.');
    var parentSel = parent.replace (/\./g, '\\.') + '\\.';
  
    var tmp = a.pop();
    var dispPre = tmp;
    var namePre = '[' + tmp + ']';
    var level = parseInt ($(this).attr('data-level'));
    for (var i = 1; i < level; i++) {         // Using parent id which is 1 level up
      // column.index
      tmp = a.pop();
      namePre = '[' + tmp + ']' + namePre;
      tmp = a.pop();
      namePre = '[' + tmp + ']' + namePre;
    }

    var parentIdSel = parentId.replace (/\./g, '\\.');
    var topSel = 'addItems\\.' + a.join('\\.');
    var numEl = $('#' + parentIdSel).attr ('data-num');
    var inumEl = parseInt (numEl);

    var delrow = $(this).parent().parent().index() + 1;  //nxtrow attr starts at 1

    // Remove the rows
    var sel = 'tr[id^="tr_' + parentSel + seq + '\\."]';
    var len = $(sel).length;
    $(sel).remove();
  
    // Set addItems's data-num
    $('#' + parentIdSel).attr ('data-num', (inumEl - 1));


    // Update remaining rows' ids and form fields' names to reflect new seq
    var iseq = parseInt (seq);
    var repl = '';
    var tmp = '';
    var ii = 0;
  
    for (var i = iseq + 1; i < inumEl; i++) {
      ii = parseInt (i) - 1;
      
      sel = '*[name^="reqbody' + namePre + '[' + i + ']"]';
      src = 'reqbody' + namePre + '[' + i + ']';
      repl = 'reqbody' + namePre + '[' + ii + ']';
      $(sel).each (function () {
        tmp = $(this).attr('name');
        tmp = tmp.replace (src, repl);
        $(this).attr('name', tmp);
      });
      
      
      sel = 'tr[id^="tr_' + parentSel + i + '\\."]';
      src = 'tr_' + parent + '.' + i + '.';
      repl = 'tr_' + parent + '.' + ii + '.';
        $(sel).each (function () {
          tmp = $(this).attr('id');
          tmp = tmp.replace (src, repl);
          $(this).attr('id', tmp);
        });
      
      
      sel = 'td[id^="td_' + parentSel + i + '\\."]';
      src = 'td_' + parent + '.' + i + '.';
      repl = 'td_' + parent + '.' + ii + '.';
      $(sel).each (function () {
        tmp = $(this).attr('id');
        tmp = tmp.replace (src, repl);
        $(this).attr('id', tmp);

        tmp = $(this).attr('id');
        if (tmp == repl) {          // no suffixes thus not lower level
          $(this).html(dispPre + '[' + ii + ']');
        }
      });
      
      
      sel = '*[id^="delItems.' + parentSel + i + '\\."]';
      src = 'delItems.' + parent + '.' + i + '.';
      repl = 'delItems.' + parent + '.' + ii + '.';
      $(sel).each (function () {
        tmp = $(this).attr('id');
        tmp = tmp.replace (src, repl);
        $(this).attr('id', tmp);
        $(this).attr('data-seq', ii);
      });
    }  // end for


    // Update other array elements' nxtrow, i.e. parent other sib
    sel = '*[id^="' + topSel + '"]';
    var nn = 0;
    
    $(sel).each (function () {
      id = $(this).attr('id');
      nn = parseInt ($(this).attr('data-nxtrow'));

      if (nn >= delrow) {
        $(this).attr ('data-nxtrow', nn - len);
      }
    });
    
  });
})();

