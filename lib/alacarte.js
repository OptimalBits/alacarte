(function(global){
  "use strict";

  function getIndent(level){
    return level * 37 + 'px';
  }

  function link(item){
    if(item.items){
      item.items[0].prev = item;
      item.items[item.items.length-1].next = item.next;

      item.items.forEach(function(subItem, i){
        subItem.parent = item;
        if(i<item.items.length-1) subItem.next = item.items[i+1];
        if(i>0) subItem.prev = item.items[i-1];
        link(subItem);
      });
    }
  }

  function action(item){
    return function(){
      switch (item.type) {
        case 'ITEM':
          item.cb();
          break;
        case 'CHECKBOX':
          item.checked = !item.checked;
          item.cb(item.checked);
          item.el.classList.toggle('checked', item.checked);
          break;
        case 'RADIO':
          item.checked = true;
          item.parent.items.forEach(function(sibling){
            if(sibling !== item && sibling.checked){
              sibling.checked = false;
              sibling.cb(sibling.checked);
              sibling.el.classList.toggle('checked', sibling.checked);
            }
          });
          item.cb(item.checked);
          item.el.classList.toggle('checked', item.checked);
          break;
        case 'EXPAND':
          item.expanded = !item.expanded;
          item.cb(item.expanded);
          item.el.classList.toggle('expanded', item.expanded);
          break;
        // case 'TABLE':
        //   break;
      }
    }
  }

  function findLast(arr, fn){
    for(var i = arr.length-1; i>=0; i--){
      if(fn(arr[i])) return arr[i];
    }
  }

  function Alacarte(){
    this.items = [];
    this.visible = false;

    this.parent = document.body;

    this.menu = document.createElement('div');
    this.menu.className = 'alacarte';

    this.header = document.createElement('div');
    this.header.className = 'header';

    this.info = document.createElement('div');
    this.info.className = 'info';

    this.list = document.createElement('ul');
    this.list.className = 'menu';

    this.menu.appendChild(this.header);
    this.menu.appendChild(this.info);
    this.menu.appendChild(this.list);
  }

  //
  // Public API
  //
  Alacarte.prototype.show = function(){
    if(!this.visible){
      this.parent.appendChild(this.menu);
      this.visible = true;
    }
    return this;
  };

  Alacarte.prototype.hide = function(){
    if(this.visible){
      this.parent.removeChild(this.menu);
      this.visible = false;
    }
    return this;
  };

  Alacarte.prototype.setHeader = function(text){
    this.header.textContent = text;
    return this;
  };

  Alacarte.prototype.setInfo = function(text){
    this.info.innerHTML = text;
    return this;
  };

  Alacarte.prototype._select = function(item){
    console.log('sel');
    if(this.selection && this.selection.el){
      this.selection.el.classList.toggle('selected', false);
    }
    this.selection = item;
    this.selection.el.classList.toggle('selected', true);
  }

  Alacarte.prototype._listen = function(item, el){
    var selectEl = function(){
      this._select(item);
    }.bind(this);

    el.addEventListener("click", function(){
      this._select(item);
      this.enter();
    }.bind(this));
    el.addEventListener("mouseover", selectEl);
    el.addEventListener("touchstart", selectEl);
    el.addEventListener("touchend", selectEl);
  }

  Alacarte.prototype._createEl = function(item, level){
    var el = document.createElement('div');
    el.classList.add('selectable');
    var header = document.createElement('h3');
    header.style.paddingLeft = getIndent(level);

    el.appendChild(header);
    header.textContent = item.title;

    return el;
  }

  Alacarte.prototype._createActionEl = function(item, level){
    item.el = this._createEl(item, level);
    item.action = action(item);
    this._listen(item, item.el);

    return item.el;
  }

  Alacarte.prototype._createCheckboxEl = function(item, level){
    item.el = this._createEl(item, level);
    item.action = action(item);

    var checkbox = document.createElement('span');
    checkbox.classList.add('checkbox');

    item.el.classList.toggle('checked', !!item.checked);
    item.el.insertBefore(checkbox, item.el.firstChild);

    this._listen(item, item.el);

    return item.el;
  }

  Alacarte.prototype._createRadioEl = function(item, level){
    item.el = this._createEl(item, level);
    item.action = action(item);

    var checkbox = document.createElement('span');
    checkbox.classList.add('checkbox');
    checkbox.classList.add('radio');

    item.el.classList.toggle('checked', !!item.checked);
    item.el.insertBefore(checkbox, item.el.firstChild);

    this._listen(item, item.el);

    return item.el;
  }

  Alacarte.prototype._createTableEl = function(item, level){
    item.el = this._createEl(item, level);
    item.action = action(item);
    var body = document.createElement('table');
    body.classList.add('table');

    item.el.appendChild(body);

    Object.keys(item.data).forEach(function(key){
      var row = document.createElement('tr');
      var keyCell = document.createElement('td');
      var valCell = document.createElement('td');
      keyCell.textContent = key+':';
      keyCell.className = 'key';
      valCell.textContent = item.data[key];
      row.appendChild(keyCell);
      row.appendChild(valCell);
      body.appendChild(row);
    });

    return item.el;
  }

  Alacarte.prototype._createExpandEl = function(item, level){
    item.el = this._createEl(item, level);
    item.action = action(item);
    var body = document.createElement('div');

    body.className = 'children';
    item.el.appendChild(body);

    this._addItemsToEl(body, item.items, level + 1);
    body.classList.add('expandable');

    item.el.classList.toggle('expanded', !!item.expanded);

    // item actions
    item.getNext = function(){
      return item.expanded ?
        item.getFirst() || item.next
        :
        item.next;
    };

    item.getPrev = function(){
      return item.prev.expanded ?
        item.prev.getLast() || item.prev
        :
        item.prev;
    };

    item.getLast = function() {
      var last = findLast(item.items, function(it){return it.cb;});
      if(last.expanded) last = last.getLast();
      return last;
    };

    item.getFirst = function() {
      return item.items.find(function(it){return it.cb;});
    };

    this._listen(item, item.el.firstChild);

    return item.el;
  }

  Alacarte.prototype._toEl = function(item, level){
    switch (item.type) {
      case 'ITEM':
        return this._createActionEl(item, level);
      case 'CHECKBOX':
        return this._createCheckboxEl(item, level);
      case 'RADIO':
        return this._createRadioEl(item, level);
      case 'TABLE':
        return this._createTableEl(item, level);
      case 'EXPAND':
        return this._createExpandEl(item, level);
    }
  }

  Alacarte.prototype._addItemsToEl = function(el, items, level){
    items.forEach(function(item, i){
      item.getNext = function() {
        return item.next.cb ?
          item.next
          :
          item.next.getNext();
      };
      item.getPrev = function() {
        return item.prev.cb?
          item.prev
          :
          item.prev.getPrev();
      };
      el.appendChild(this._toEl(item, level));
    }.bind(this));
  }

  Alacarte.prototype.setItems = function(items){
    this.root = {
      items: items,
      getNext: function(){return items[0];},
      getPrev: function(){return items[items.length-1];}
    };
    link(this.root);
    items[0].prev = items[items.length-1];
    items[items.length-1].next = items[0];
    this._addItemsToEl(this.list, items, 1);
    this.selection = this.root;
  }

  Alacarte.prototype.enter = function(){
    console.log('enter');
    this.selection.action();
  };

  Alacarte.prototype.up = function(){
    console.log('up');
    this._select(this.selection.getPrev());
  };

  Alacarte.prototype.down = function(){
    console.log('down');
    this._select(this.selection.getNext());
  };

  // package module for different environments
  function packageModule(name, api) {
    if (global.define && global.define.amd) {
      define([], api);
    } else if (typeof exports !== "undefined") {
      module.exports = api;
    } else {
      global[name] = api;
    }
  }
  packageModule('Alacarte', Alacarte);
})(this);
