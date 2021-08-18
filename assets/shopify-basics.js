
/*
 * Shopify Common JS
 *
 */
if ((typeof window.Shopify) == 'undefined') {
    window.Shopify = {};
  }
  
  /**
    * Bind function to element
    *
    * @param {function} fn - Function to bind
    * @param {element} scope - Element function binds to
    */
  Shopify.bind = function(fn, scope) {
    return function() {
      return fn.apply(scope, arguments);
    }
  };
  
  Shopify.setSelectorByValue = function(selector, value) {
    for (var i = 0, count = selector.options.length; i < count; i++) {
      var option = selector.options[i];
      if (value == option.value || value == option.innerHTML) {
        selector.selectedIndex = i;
        return i;
      }
    }
  };
  
  Shopify.addListener = function(target, eventName, callback) {
    target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on'+eventName, callback);
  };
  
  Shopify.postLink = function(path, options) {
    options = options || {};
    var method = options['method'] || 'post';
    var params = options['parameters'] || {};
  
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
  
    for(var key in params) {
      var hiddenField = document.createElement("input");
      hiddenField.setAttribute("type", "hidden");
      hiddenField.setAttribute("name", key);
      hiddenField.setAttribute("value", params[key]);
      form.appendChild(hiddenField);
    }
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };
  
  /**
   * Format money values based on your shop currency settings
   * @param  {Number|string} cents - value in cents or dollar amount e.g. 300 cents
   * or 3.00 dollars
   * @return {String} value - formatted value
   */
  Shopify.formatMoney = function(cents, format){
    if (format == null || format == undefined){
      format = window.globalVariables.money_format || "${{amount}}";
    }
    if (typeof cents == 'string') { cents = cents.replace('.',''); }
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = (format || this.money_format);
    function defaultOption(opt, def) {
      return (typeof opt == 'undefined' ? def : opt);
    }
    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = defaultOption(precision, 2);
      thousands = defaultOption(thousands, ',');
      decimal   = defaultOption(decimal, '.');
      if (isNaN(number) || number == null) { return 0; }
      number = (number/100.0).toFixed(precision);
      var parts   = number.split('.'),
          dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
          cents   = parts[1] ? (decimal + parts[1]) : '';
      return dollars + cents;
    }
    switch(formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
    }
    return formatString.replace(placeholderRegex, value);
  };
  
  Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
    this.countryEl         = document.getElementById(country_domid);
    this.provinceEl        = document.getElementById(province_domid);
    this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);
  
    Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler,this));
  
    this.initCountry();
    this.initProvince();
  };
  
  Shopify.CountryProvinceSelector.prototype = {
    initCountry: function() {
      var value = this.countryEl.getAttribute('data-default');
      Shopify.setSelectorByValue(this.countryEl, value);
      this.countryHandler();
    },
  
    initProvince: function() {
      var value = this.provinceEl.getAttribute('data-default');
      if (value && this.provinceEl.options.length > 0) {
        Shopify.setSelectorByValue(this.provinceEl, value);
      }
    },
  
    countryHandler: function(e) {
      var opt       = this.countryEl.options[this.countryEl.selectedIndex];
      var raw       = opt.getAttribute('data-provinces');
      var provinces = JSON.parse(raw);
  
      this.clearOptions(this.provinceEl);
      if (provinces && provinces.length == 0) {
        this.provinceContainer.style.display = 'none';
      } else {
        for (var i = 0; i < provinces.length; i++) {
          var opt = document.createElement('option');
          opt.value = provinces[i][0];
          opt.innerHTML = provinces[i][1];
          this.provinceEl.appendChild(opt);
        }
  
        this.provinceContainer.style.display = "";
      }
    },
  
    clearOptions: function(selector) {
      while (selector.firstChild) {
        selector.removeChild(selector.firstChild);
      }
    },
  
    setOptions: function(selector, values) {
      for (var i = 0, count = values.length; i < values.length; i++) {
        var opt = document.createElement('option');
        opt.value = values[i];
        opt.innerHTML = values[i];
        selector.appendChild(opt);
      }
    }
  };
  