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
    if(oldSelection) oldSelection.el.classList.toggle('selected', false);

    this.selected = id;
    var newSelection = this.items[this.selected];
    if(newSelection) newSelection.el.classList.toggle('selected', true);
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

  Alacarte.prototype._add = function(parent, item, selectElem, cb){
    var _this = this;
    var id = this.items.length;

    function select(){
      _this._select(id);
    }

    selectElem.id = id;

    selectElem.addEventListener("click", function(){
      select();
      _this.enter();
    });
    selectElem.addEventListener("mouseover", select);
    selectElem.addEventListener("touchstart", select);
    selectElem.addEventListener("touchend", select);

    this.items[id] = {
      cb: cb,
      el: selectElem
    };
    parent.appendChild(item);

    select();
    return this;
  };

  Alacarte.prototype.addCheckbox = function(text, checked, cb){
    var item = document.createElement('li');
    var textDiv = document.createElement('div');
    textDiv.textContent = text;
    textDiv.className = 'item';
    var checkbox = document.createElement('span');
    checkbox.className = checked ? 'checked' : '';

    item.appendChild(checkbox);
    item.appendChild(textDiv);

    function toggle(){
      checked = !checked;
      checkbox.className = checked ? 'checked' : '';
      cb(checked);
    }

    return this._add(this.list, item, item, toggle);
  };

  Alacarte.prototype._addItem = function(parent, text, cb){
    var item = document.createElement('li');
    var textDiv = document.createElement('div');
    textDiv.textContent = text;
    textDiv.className = 'item';

    item.appendChild(textDiv);

    return this._add(parent, item, item, cb);
  };

  Alacarte.prototype.addItem = function(text, cb){
    return this._addItem(this.list, text, cb);
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

  Alacarte.prototype._addExpandPane = function(title, pane){
    var item = document.createElement('li');
    var titleEl = document.createElement('div');
    var icon = document.createElement('div');
    var expanded = true;

    titleEl.textContent = title;
    titleEl.className = 'item';
    icon.className = 'icon';
    item.appendChild(icon);
    item.appendChild(titleEl);
    item.appendChild(pane);

    function togglePane(){
      expanded = !expanded;
      pane.className = expanded ? '' : 'hidden';
      icon.textContent = expanded ? '\u25bc' : '\u25ba';
    }

    togglePane();

    return this._add(this.list, item, titleEl, togglePane);
  };

  Alacarte.prototype.addExpandPane = function(title, obj){
    var pane = toDom(obj);
    return this._addExpandPane(title, pane);
  };

  Alacarte.prototype.addSelect = function(title, items){
    var container = document.createElement('div');
    var pane = document.createElement('ul');
    pane.className = 'menu';
    container.appendChild(pane);

    var ret = this._addExpandPane(title, container);

    this._addItem(container, 'asdf', function() {
      console.log('sel');
    });

    return ret;
  };

  Alacarte.prototype._isHidden = function(id) {
    var el = this.items[id].el;
    return (el.offsetParent === null)
  }

  Alacarte.prototype.enter = function(){
    var selection = this.items[this.selected];
    if(selection) selection.cb();
  };

  Alacarte.prototype.up = function(step){
    step = step || 1;
    var id = (this.selected + this.items.length - step) % this.items.length;
    if(this._isHidden(id)){
      this.up(step+1);
      return;
    }
    this._select(id);
  };

  Alacarte.prototype.down = function(step){
    step = step || 1;
    var id = (this.selected + this.items.length + step) % this.items.length;
    if(this._isHidden(id)){
      this.down(step+1);
      return;
    }
    this._select(id);
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
