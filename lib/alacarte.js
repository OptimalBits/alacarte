(function(global){
  "use strict";

  function Alacarte(opts){
    this.items = [];
    this.selected;
    this.visible = false;

    this.opts = opts || {};
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

  Alacarte.prototype._select = function(id){
    var oldSelection = this.items[this.selected];
    if(oldSelection) oldSelection.el.className = '';

    this.selected = id;
    var newSelection = this.items[this.selected];
    if(newSelection) newSelection.el.className = 'selected';
  };

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

  Alacarte.prototype._add = function(item, cb){
    var _this = this;
    var id = this.items.length;

    function select(){
      _this._select(id);
    }

    item.id = id;

    item.addEventListener("click", function(){
      select();
      _this.enter();
    });
    item.addEventListener("mouseover", select);
    item.addEventListener("touchstart", select);
    item.addEventListener("touchend", select);

    this.items[id] = {
      cb: cb,
      el: item
    };
    this.list.appendChild(item);

    select();
    return this;
  };

  Alacarte.prototype.addCheckbox = function(text, checked, cb){
    var item = document.createElement('li');
    var textDiv = document.createElement('div');
    textDiv.textContent = text;
    var checkbox = document.createElement('span');
    checkbox.className = checked ? 'checked' : '';

    item.appendChild(checkbox);
    item.appendChild(textDiv);

    function toggle(){
      checked = !checked;
      checkbox.className = checked ? 'checked' : '';
      cb(checked);
    }

    return this._add(item, toggle);
  };

  Alacarte.prototype.addItem = function(text, cb){
    var item = document.createElement('li');
    var textDiv = document.createElement('div');
    textDiv.textContent = text;

    item.appendChild(textDiv);

    return this._add(item, cb);
  };

  function toDom(obj) {
    var el = document.createElement('table');
    Object.keys(obj).forEach(function(key){
      var row = document.createElement('tr');
      var keyCell = document.createElement('td');
      var valCell = document.createElement('td');
      keyCell.textContent = key+':';
      keyCell.className = 'key';
      valCell.textContent = obj[key];
      row.appendChild(keyCell);
      row.appendChild(valCell);
      el.appendChild(row);
    });

    return el;
  }

  Alacarte.prototype.addInfoPaneItem = function(text, obj){
    var item = document.createElement('li');
    var textDiv = document.createElement('div');
    var paneDiv = toDom(obj);

    textDiv.textContent = text;
    item.appendChild(textDiv);
    item.appendChild(paneDiv);

    function togglePane(){
      paneDiv.className = paneDiv.className.includes('hidden') ? '' : 'hidden';
    }

    togglePane();

    return this._add(item, togglePane);
  };


  Alacarte.prototype.enter = function(){
    var selection = this.items[this.selected];
    if(selection) selection.cb();
  };

  Alacarte.prototype.up = function(){
    this._select((this.selected + this.items.length - 1) % this.items.length);
  };

  Alacarte.prototype.down = function(){
    this._select((this.selected + this.items.length + 1) % this.items.length);
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
