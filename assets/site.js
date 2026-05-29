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
  if(monsterFilter){
    var rows = Array.prototype.slice.call(document.querySelectorAll('tr[data-monster-name]'));
    var letterRows = Array.prototype.slice.call(document.querySelectorAll('tr.letter-row'));

    function updateLetterRows(){
      letterRows.forEach(function(letterRow){
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
        var source = row.getAttribute('data-monster-source') || (name.indexOf('converted') !== -1 ? 'converted' : 'core');
        var sourceOK = (source === 'core' && showCore) || (source === 'converted' && showConverted);
        var textOK = !q || name.indexOf(q) !== -1;
        row.style.display = sourceOK && textOK ? '' : 'none';
      });
      updateLetterRows();
    }

    monsterFilter.addEventListener('input', applyMonsterFilters);
    if(sourceCore) sourceCore.addEventListener('change', applyMonsterFilters);
    if(sourceConverted) sourceConverted.addEventListener('change', applyMonsterFilters);
    applyMonsterFilters();
  }
})();
