(function(){
  function norm(s){ return (s || '').toLowerCase(); }

  document.querySelectorAll('input[type="search"][data-filter-target]').forEach(function(input){
    if (input.__wbBound) return;
    input.__wbBound = true;
    var selector = input.getAttribute('data-filter-target');
    var root = input.closest('.side-nav') || document;
    var items = Array.prototype.slice.call(root.querySelectorAll(selector));
    input.addEventListener('input', function(){
      var q = norm(input.value);
      items.forEach(function(item){
        item.style.display = !q || norm(item.textContent).indexOf(q) !== -1 ? '' : 'none';
      });
    });
  });

  var monsterFilter = document.querySelector('#monster-filter');
  var sourceCore = document.querySelector('#monster-source-core');
  var sourceConverted = document.querySelector('#monster-source-converted');
  var monsterHasImage = document.querySelector('#monster-has-image');
  var monsterSort = document.querySelector('#monster-sort');
  var monsterTbody = document.querySelector('#monster-index-body');
  var alphaNav = document.querySelector('.alpha-nav');
  if(monsterFilter){
    var rows = Array.prototype.slice.call(document.querySelectorAll('tr[data-monster-name]'));

    function rowName(row){ return row.getAttribute('data-name-sort') || norm(row.getAttribute('data-monster-name')); }
    function rowNumber(row, attr){
      var raw = row.getAttribute(attr);
      var value = parseFloat(raw);
      return isNaN(value) ? 99999 : value;
    }
    function letterFor(row){
      var name = rowName(row).replace(/^(the|a|an)\s+/, '');
      var ch = name.charAt(0).toUpperCase();
      return ch >= 'A' && ch <= 'Z' ? ch : '#';
    }
    function makeLetterRow(letter){
      var tr = document.createElement('tr');
      tr.className = 'letter-row';
      var th = document.createElement('th');
      th.colSpan = 4;
      th.id = letter;
      th.textContent = letter;
      tr.appendChild(th);
      return tr;
    }

    function rebuildMonsterRows(){
      if(!monsterTbody) return;
      var sortBy = monsterSort ? monsterSort.value : 'name';
      rows.sort(function(a, b){
        if(sortBy === 'hd') return rowNumber(a, 'data-hd-sort') - rowNumber(b, 'data-hd-sort') || rowName(a).localeCompare(rowName(b));
        if(sortBy === 'hde') return rowNumber(a, 'data-hde-sort') - rowNumber(b, 'data-hde-sort') || rowName(a).localeCompare(rowName(b));
        return rowName(a).localeCompare(rowName(b));
      });
      monsterTbody.innerHTML = '';
      if(sortBy === 'name'){
        var lastLetter = '';
        rows.forEach(function(row){
          var letter = letterFor(row);
          if(letter !== lastLetter){
            lastLetter = letter;
            monsterTbody.appendChild(makeLetterRow(letter));
          }
          monsterTbody.appendChild(row);
        });
        if(alphaNav) alphaNav.style.display = '';
      } else {
        rows.forEach(function(row){ monsterTbody.appendChild(row); });
        if(alphaNav) alphaNav.style.display = 'none';
      }
    }

    function updateLetterRows(){
      Array.prototype.slice.call(document.querySelectorAll('tr.letter-row')).forEach(function(letterRow){
        var visible = false;
        var node = letterRow.nextElementSibling;
        while(node && !node.classList.contains('letter-row')){
          if(node.matches && node.matches('tr[data-monster-name]') && node.style.display !== 'none'){
            visible = true;
            break;
          }
          node = node.nextElementSibling;
        }
        letterRow.style.display = visible ? '' : 'none';
      });
    }

    function applyMonsterFilters(){
      var q = norm(monsterFilter.value);
      var showCore = !sourceCore || sourceCore.checked;
      var showConverted = !sourceConverted || sourceConverted.checked;
      rows.forEach(function(row){
        var name = norm(row.getAttribute('data-monster-name'));
        var source = row.getAttribute('data-monster-source') || 'core';
        var sourceOK = (source === 'core' && showCore) || (source === 'converted' && showConverted);
        var textOK = !q || name.indexOf(q) !== -1;
        var imageOK = !monsterHasImage || !monsterHasImage.checked || row.getAttribute('data-monster-image') === 'true';
        row.style.display = sourceOK && textOK && imageOK ? '' : 'none';
      });
      updateLetterRows();
    }

    monsterFilter.addEventListener('input', applyMonsterFilters);
    if(sourceCore) sourceCore.addEventListener('change', applyMonsterFilters);
    if(sourceConverted) sourceConverted.addEventListener('change', applyMonsterFilters);
    if(monsterHasImage) monsterHasImage.addEventListener('change', applyMonsterFilters);
    if(monsterSort) monsterSort.addEventListener('change', function(){ rebuildMonsterRows(); applyMonsterFilters(); });
    rebuildMonsterRows();
    applyMonsterFilters();
  }

  // Maze Rats automatic table rollers.
  function rollDie(){ return Math.floor(Math.random() * 6) + 1; }
  function cellText(cell){ return (cell ? cell.textContent : '').replace(/\s+/g, ' ').trim(); }
  function rollMatches(label, value){
    label = (label || '').trim();
    if(label === String(value)) return true;
    var range = label.match(/^(\d+)\s*-\s*(\d+)$/);
    if(range){
      var lo = parseInt(range[1], 10), hi = parseInt(range[2], 10);
      return value >= lo && value <= hi;
    }
    return false;
  }
  function findRowByRoll(table, value){
    var rows = Array.prototype.slice.call(table.querySelectorAll('tbody tr'));
    for(var i = 0; i < rows.length; i++){
      var first = rows[i].querySelector('td');
      if(first && rollMatches(cellText(first), value)) return rows[i];
    }
    return null;
  }
  function resultFromRow(row){
    if(!row) return '';
    var cells = Array.prototype.slice.call(row.querySelectorAll('td')).slice(1);
    return cells.map(cellText).filter(Boolean).join(' — ');
  }
  document.querySelectorAll('button[data-roll-table]').forEach(function(button){
    if(button.__wbRollBound) return;
    button.__wbRollBound = true;
    button.addEventListener('click', function(){
      var table = document.getElementById(button.getAttribute('data-roll-table'));
      if(!table) return;
      var type = button.getAttribute('data-roll-type') || table.getAttribute('data-roll-type') || '2d6';
      var output = button.parentNode ? button.parentNode.querySelector('.roll-output') : null;
      var message = '';
      if(type === 'spell-formula'){
        var d1 = rollDie(), d2 = rollDie();
        var row = findRowByRoll(table, d1);
        var cells = row ? Array.prototype.slice.call(row.querySelectorAll('td')) : [];
        var result = cellText(cells[d2 <= 3 ? 1 : 2]);
        message = 'Roll ' + d1 + ', ' + d2 + ': ' + result;
      } else if(type === '1d6'){
        var one = rollDie();
        var row1 = findRowByRoll(table, one);
        message = 'Roll ' + one + ': ' + resultFromRow(row1);
      } else {
        var a = rollDie(), b = rollDie();
        var key = String(a) + String(b);
        var row2 = findRowByRoll(table, key);
        message = 'Roll ' + a + ', ' + b + ' (' + key + '): ' + resultFromRow(row2);
      }
      if(output) output.textContent = message;
    });
  });

})();
