/**
 * Product Form Components
 *
 */
 class ProductForm extends HTMLElement {
    constructor() {
      super();
  
      this.form = this.querySelector('form');
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.cartElement = document.querySelector('ajax-cart');
  
      this.qtyBtns = this.querySelectorAll('[data-qty-btn]');
      this.qtyBtns.forEach(qtyBtn => qtyBtn.addEventListener('click', this.manageQtyBtn.bind(this)));
    }
  
    /**
     * Product Form Submit event
     *
     * @param {evt} Event instance
     */
    onSubmitHandler(evt) {
      evt.preventDefault();
  
      const submitButton = this.querySelector('[type="submit"]');
      const qtyInput = this.querySelector('[data-qty-input]');
      
      submitButton.setAttribute('disabled', true);
      submitButton.classList.add('loading');
  
      const body = JSON.stringify({
        ...JSON.parse(serializeForm(this.form))
      });
  
      fetch(`${routes.cart_add_url}`, { ...fetchConfig('javascript'), body })
        .then((response) => response.json())
        .then((parsedState) => {
          this.cartElement.getCartData('open_drawer');
          if(qtyInput) qtyInput.value = 1;
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          submitButton.classList.remove('loading');
          submitButton.removeAttribute('disabled');
        });
    }
  
    /**
     * Product Form Quantity Input update action
     *
     * @param {event} Event instance
     */
    manageQtyBtn(event) {
      event.preventDefault();
      let currentTarget = event.currentTarget;
      let action = currentTarget.dataset.for || 'increase';
      let $qtyInput = currentTarget.closest('[data-qty-container]').querySelector('[data-qty-input]');
      let currentQty = parseInt($qtyInput.value) || 1;
      let finalQty = 1;
  
      if(action == 'decrease' && currentQty <= 1){
          return false;
      }else if(action == 'decrease'){
          finalQty = currentQty - 1;
      }else{
          finalQty = currentQty + 1;
      }
  
      $qtyInput.value = finalQty;
    }
  }
  customElements.define('product-form', ProductForm);
  
  
  class VariantSelects extends HTMLElement {
    constructor() {
      super();
      this.form = this.closest('form');
      this.formType = this.form.dataset.format;
      this.addBtn = this.form.querySelector('[name="add"]');
      this.variant_json = this.form.querySelector('[data-variantJSON]');
      this.variantPicker = this.dataset.type;
  
      this.addEventListener('change', this.onVariantChange);
    }

    onVariantChange() {
      this.setCurrentVariant();
  
      if (!this.currentVariant) {
        this.toggleAddButton('disable');
      } else {
        if(this.formType == 'product-grid'){
          const productGrid = this.closest('[data-product-grid]');
          this._updateLinks(productGrid); 
          this.renderProductInfo(this.currentVariant, productGrid);
        }else{
          this.renderProductInfo(this.currentVariant, this.form);
        }
        this.updateURLandID(this.currentVariant);
        this.toggleAddButton('enable');
      }
    }
  
    _updateLinks(productGrid){
      if(!this.currentVariant || !productGrid) return;
      const variantURL = '?variant=' + this.currentVariant.id;
      const formLinks = productGrid.querySelectorAll('.product-link');
      formLinks.forEach(link => {
        let href = link.href.split('?')[0];
        link.href = href + variantURL;
      });
    }

    _getOptionsFromSelect() {
      let options = [];
      this.querySelectorAll('.variant_selector').forEach((selector)=>{
        options.push(selector.value);
      });
      return options;
    }
  
    _getOptionsFromRadio() {
      const fieldsets = Array.from(this.querySelectorAll('fieldset'));
      const options = fieldsets.map((fieldset) => {
        return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
      });
      return options;
    }
  
    setCurrentVariant() {
      // get all current values from selectors
      let options = (this.variantPicker == 'variant-select') ? this._getOptionsFromSelect() : this._getOptionsFromRadio();
  
      let variantsArray = this._getVariantData();
      console.log(variantsArray); 
      variantsArray.find((variant) => {
        
        // get true or false based on options value presented in variant
        // value format would be [true/false,true/fasle,true/false] boolean value based on options present or not
        let mappedValues = variant.options.map((option, index) => {
          return options[index] === option;
        });
  
        // assign variant details to this.currentVariant if all options are present
        if(!mappedValues.includes(false)){
          this.currentVariant = variant;
          return;
        }
      });
    }
  
    updateURLandID(currentVariant) {
      if (!currentVariant) return;
  
      // update query string with latest variant ID
      if(this.formType != 'product-grid') window.history.replaceState({ }, '', `${this.dataset.url}?variant=${currentVariant.id}`);
  
      // update variant input with currentVariant Id
      const input = this.form.querySelector('input[name="id"]');
      input.value = currentVariant.id;
    }
  
    renderProductInfo(currentVariant, container) {
      if(!currentVariant || !container) return;

      // Price Update
      let price = Shopify.formatMoney(currentVariant.price, window.globalVariables.money_format);
      let compare_price = Shopify.formatMoney(currentVariant.compare_at_price, window.globalVariables.money_format);
      
      let priceElement = container.querySelector('[data-currentPrice]');
      let comparePriceElement = container.querySelector('[data-comparePrice]');
      if(this.formType != 'product-grid'){
        if(!priceElement){ priceElement = this.closest('.product-details-wrapper').querySelector('[data-currentPrice]');}
        if(!comparePriceElement){comparePriceElement = this.closest('.product-details-wrapper').querySelector('[data-comparePrice]');}
      }

      if(priceElement) priceElement.innerHTML = price;
      if(comparePriceElement) priceElement.innerHTML = compare_price;

      // Grid Image Update on variant selection
      if(this.formType == 'product-grid'){
        const featuredImage = container.querySelector('[data-feauredImage]');
        let updatedSrc = currentVariant.featured_image.src;
        if(updatedSrc){
          featuredImage.src = updatedSrc;
          featuredImage.srcset = updatedSrc;
        }
      }else{
        let imageID = currentVariant.featured_image.id;
        let imageSlide = document.querySelector(`.product--image[data-imageID="${imageID}"]`);
        if(!imageSlide) return;
        let slideIndex = Array.from(imageSlide.parentNode.children).indexOf(imageSlide);
        if(productSlider)  productSlider.slideTo(slideIndex, 2000, true);
      }

      // Variant name update
      let options = this.form.querySelectorAll('[data-optionindex]');
      options.forEach(option => {
        let lableID = 'option'+option.dataset.optionindex;
        const lable = option.querySelector('.selected-option');
        if(!lable || !lableID) return;
        lable.innerHTML = currentVariant[lableID];
      });
    }
  
    toggleAddButton(status) {
      if (!this.addBtn) return;

      if (status == 'disable') {
        this.addBtn.setAttribute('disabled', true);
        if(this.addBtn.querySelector('.add-text'))
          this.addBtn.querySelector('.add-text').textContent = window.variantStrings.unavailable;
      } else {
        this.addBtn.removeAttribute('disabled');
        if(this.addBtn.querySelector('.add-text'))
          this.addBtn.querySelector('.add-text').textContent = window.variantStrings.addToCart;;
      };
    }
  
    _getVariantData() {
      this.variantData = this.variantData || JSON.parse(this.variant_json.textContent);
      return this.variantData;
    }
  }
  
  customElements.define('variant-selects', VariantSelects);
  
  class VariantRadios extends VariantSelects {
    constructor() {
      super();

      this.form = this.closest('form');
      this.formType = this.form.dataset.format;

      const colorSwatchContainer = this.querySelector('.color-swatch');
      if(colorSwatchContainer){
        const colorSwatches = colorSwatchContainer.querySelectorAll('.swatch');
        colorSwatches.forEach(swatch => {
          let colorHandle = swatch.querySelector('input[type="radio"]').dataset.handle;
          let swatchStyle = Utility.getSwatchStyle(colorHandle);
          swatch.querySelector('.swatch-label').setAttribute('style', swatchStyle);
        });
      }
    }
  }
  customElements.define('variant-radios', VariantRadios);