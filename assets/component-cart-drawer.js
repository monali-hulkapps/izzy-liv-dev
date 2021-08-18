
// Ajax cart JS for Drawer and Cart Page
class ajaxCart extends HTMLElement {
    constructor() {
      super();
  
      this.openeBy = document.querySelectorAll('.header__icon--cart');
      this.isOpen =  this.classList.contains('open--drawer');
      this.bindEvents();
  
      if(window.globalVariables.template != 'cart'){
        this.addAccessibilityAttributes(this.openeBy);
        this.getCartData();
      }else{
        this.style.visibility = 'visible';
      }
      if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
    }
  
    /**
     * Observe attribute of component
     * 
     * @returns {array} Attributes to Observe
     */
    static get observedAttributes() {
      return ['updating'];
    }
  
    /**
     * To Perform operation when attribute is changed
     * Calls attributeChangedCallback() with params when attribute value is updated
     * 
     * @param {string} name attribute name
     * @param {string} oldValue attribute Old value
     * @param {string} newValue attribute latest value
     */
    attributeChangedCallback(name, oldValue, newValue) {
      // called when one of attributes listed above is modified
      if(name == 'updating' && newValue == 'false'){
        this.updateEvents();
      }
    }
  
    /**
     * Add accessibility attributes to Open Drawer buttons
     * 
     * @param {Node Array} openDrawerButtons Cart Icons
     */
    addAccessibilityAttributes(openDrawerButtons) {
      let _this = this;
      openDrawerButtons.forEach(element => {
        element.setAttribute('role', 'button');
        element.setAttribute('aria-expanded', false);
        element.setAttribute('aria-controls', _this.id);
      });
    }
  
    /**
     * Escape Click event to close drawer when focused within Cart Drawer
     *
     * @param {event} Event instance
     */
    onKeyUp(event) {
      if(event.code.toUpperCase() !== 'ESCAPE') return;
      this.querySelector('.close-ajax--cart').dispatchEvent(new Event('click'));
    }
  
    /**
     * bind dclick and keyup event to Cart Icons
     * bind keyUp event to Cart drawer component
     * bind Other inside element events
     *
     */
    bindEvents() {
      if(window.globalVariables.template != 'cart'){
        this.openeBy.forEach(cartBtn => cartBtn.addEventListener('click', this.openCartDrawer.bind(this)));
        this.addEventListener('keyup', this.onKeyUp.bind(this));
      }
      this.updateEvents();
    }
  
    /**
     * bind Other inside element events to DOM
     *
     */
    updateEvents(){
      this.querySelectorAll('.close-ajax--cart').forEach(button => button.addEventListener('click', this.closeCartDrawer.bind(this)));
      this.querySelectorAll('[data-itemRemove]').forEach(button => button.addEventListener('click', this.removItem.bind(this)));
      this.querySelectorAll('[data-qty-btn]').forEach(button => button.addEventListener('click', this.manageQtyBtn.bind(this)));
    }
  
    /**
     * Open Cart drawer and add focus to drawer container
     *
     * @param {event} Event instance
     */
    openCartDrawer(event) {
      if(!window.globalVariables.cart_drawer){
        window.location.href = window.routes.cart_fetch_url || '/cart';
        return;
      }
  
      if(document.querySelector('#mobile-menu-drawer').classList.contains('opened-drawer')){
        document.querySelector('.close-mobile--navbar').dispatchEvent(new Event('click'));
      }
  
      this.classList.add('opened-drawer');
      siteOverlay.prototype.showOverlay();
      Utility.forceFocus(this.querySelector('.cart-title'));
      let closeBtn = this.querySelector('.close-ajax--cart');
      Utility.trapFocus(this, closeBtn);
  
      if(event){
        event.preventDefault();
        let openBy = event.currentTarget;
        openBy.setAttribute('aria-expanded', true);
      }
    }
  
    /**
     * Close Cart drawer and Remove focus from drawer container
     *
     * @param {event} Event instance
     */
    closeCartDrawer(event, elementToFocus = false) {
      if (event !== undefined) {
        event.preventDefault();
        this.classList.remove('opened-drawer');
        siteOverlay.prototype.hideOverlay();
        let openByEle = event.currentTarget;
        openByEle.setAttribute('aria-expanded', false);
        Utility.removeTrapFocus(elementToFocus);
  
        let actionBtn = document.getElementById('cart-icon-desktop');
        if(window.innerWidth < 1024){
          actionBtn = document.getElementById('cart-icon-mobile');
        }
        Utility.forceFocus(actionBtn);
      }
    }
  
    /**
     * Update cart HTML and Trigger Open Drawer event
     *
     * @param {string} cartHTML String formatted response from fetch cart.js call
     * @param {string} action Open Drawer as value if need to Open Cart drawer
     */
    _updateCart(cartHTML, action){
        this.setAttribute('updating', true);
  
        // Convert the HTML string into a document object
        let parser = new DOMParser();
        cartHTML = parser.parseFromString(cartHTML, 'text/html');
  
        let cartElement = cartHTML.querySelector('ajax-cart');
        this.innerHTML = cartElement.innerHTML;
        this.setAttribute('updating', false);
  
        let cartIcon = cartHTML.getElementById('cart-icon-desktop');
        if(document.getElementById('cart-icon-desktop')) document.getElementById('cart-icon-desktop').innerHTML = cartIcon.innerHTML;
        if(document.getElementById('cart-icon-mobile')) document.getElementById('cart-icon-mobile').innerHTML = cartIcon.innerHTML;
  
        if(window.globalVariables.cart_drawer == true && action == 'open_drawer' && window.globalVariables.template != 'cart'){
            this.openCartDrawer();
        }
    }
  
    /**
     * Fetch latest cart data 
     *
     * @param {string} action Open Drawer as value if need to Open Cart drawer or else let it be empty
     */
    getCartData(action){
        const fetchCart = fetch(`${routes.cart_fetch_url}`);
        fetchCart.then(response => {
          return response.text();
        }).then(response => {
            this._updateCart(response, action);
        }).catch((e) => {
            console.error(e);
        }).finally(() => {
            // Cart HTML fetch done
        });
    }
  
     /**
     * Update Quantity API call 
     *
     * @param {string} line Line Index value of cart Item (Starts from 1)
     * @param {integer} quantity Quantity to update
     */
    updateItemQty(line, quantity){
        let lineItem = document.querySelectorAll('[data-cart-item]')[line-1];

        if(lineItem){ lineItem.classList.add('updating'); }
        const body = JSON.stringify({
            line,
            quantity
        });
  
        fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body }})
        .then((response) => {
            return response.text();
        })
        .then((state) => {
          this.getCartData();
          setTimeout(() => {
            if(lineItem){ lineItem.classList.remove('updating'); }
          }, 1000);
        }).catch((error) => {
          setTimeout(() => {
            if(lineItem){ lineItem.classList.remove('updating'); }
          }, 1000);
          console.log(error);
        });
    }
  
    /**
     * Remove Item Event
     *
     * @param {event} Event instance
     */
    removItem(event){
      event.preventDefault();
      let currentTarget = event.currentTarget;
      let itemIndex = currentTarget.dataset.index || null;
      if(itemIndex != null){
          this.updateItemQty(itemIndex, 0);
      }
    }
  
    /**
     * Cart Item Qunatity Increment/Decrement Button event
     *
     * @param {event} Event instance
     */
    manageQtyBtn(event){
      event.preventDefault();
      let currentTarget = event.currentTarget;
      let action = currentTarget.dataset.for || 'increase';
      let $qtyInput = currentTarget.closest('[data-qty-container]').querySelector('[data-qty-input]');
      let itemIndex = $qtyInput.dataset.index || 1;
      let currentQty = parseInt($qtyInput.value) || 1;
      let finalQty = 1;
  
      if(action == 'decrease' && currentQty <= 1){
          return false;
      }else if(action == 'decrease'){
          finalQty = currentQty - 1;
      }else{
          finalQty = currentQty + 1;
      }
      this.updateItemQty(itemIndex, finalQty);
    }
  
  }
  customElements.define("ajax-cart", ajaxCart);
  