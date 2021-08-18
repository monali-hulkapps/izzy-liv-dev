let productSlider = null;

/**
  * prevent body Touch event in Touch devices when Overlay is visible
  *
  * @param {event} event - event instance
*/
function bodyTouchMove(event){
  let currentTarget = event.target;
  if (!currentTarget.closest('[data-touch-moveable]')) {
    event.preventDefault();
    return false;
  }
}

/**
  * Limit the number of times a function is called within defined timeout
  *
  * @param {form} form - Form to serialize
*/
const serializeForm = form => {
  const obj = {};
  const formData = new FormData(form);
  for (const key of formData.keys()) {
    obj[key] = formData.get(key);
  }
  return JSON.stringify(obj);
};

/**
  * Fetch call config
  *
  * @param {string} type - request Accept type
*/
function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}


/**
  * Dropdown component Events and Methods
  *
  * @param {element} element - Dropdown element
  */
 function dropDownInit(element){
 
  let dropdownParent = element.parentElement;
  const _this = element;
  let deviceType = Utility.deviceType();

  ["mouseover", "focusin",  "click", "touchend", "mouseout"].forEach(function(type){
    if(type == 'click' || type == 'touchend'){
      dropdownParent.addEventListener(type, (e) => {
        e.stopPropagation();
        dropdownToggle(dropdownParent);
      });
    } else if(type == 'mouseout'){
      dropdownParent.addEventListener(type, (e) => {
        e.stopPropagation();
        dropdownHide(dropdownParent);
      });
    } else if(type == 'mouseover' || type == 'focusin'){
      dropdownParent.addEventListener(type, (e) => { dropdownShow(dropdownParent); });
      _this.addEventListener(type, (e) => { ChildonFocusChange(dropdownParent); });
    }
  });

  dropdownParent.addEventListener('keyup', (event) => {
    if (event.code.toUpperCase() === 'ESCAPE'){ dropdownHide(event.currentTarget); }
    if (event.code.toUpperCase() === 'ENTER'){ dropdownShow(event.currentTarget); }
  });

  function dropdownToggle(dropdownParent) {
    let isActive = dropdownParent.classList.contains('open');
    setTimeout(function(){
      if(!isActive){ dropdownShow(dropdownParent); }
      else if(isActive){ dropdownHide(dropdownParent); }
    }, 50);
  }

  function dropdownShow(dropdownParent){
    _this.setAttribute('aria-expanded', true);
    if(!dropdownParent.closest('[data-role="drawer"]')){
      dropdownParent.classList.add('open');
    }else{
      Utility.toggleElement(dropdownParent, 'open');
    }
  }

  function dropdownHide(dropdownParent){
    _this.setAttribute('aria-expanded', false);
    if(!dropdownParent){
      return;
    }

    if(!dropdownParent.closest('[data-role="drawer"]')){
      dropdownParent.classList.remove('open');
    }else{
      Utility.toggleElement(dropdownParent, 'close');
    }
    if(event && event.type == 'mouseout' && dropdownParent.parentElement.closest('.dropdown')){
      dropdownParent.parentElement.closest('.dropdown').classList.remove('open');
    }

    let childDropdowns = dropdownParent.querySelectorAll('.dropdown.open');
    if(childDropdowns.length > 0){
      childDropdowns.forEach(function(child){
        child.classList.remove('open');
        if(child.querySelector('a[data-toggle="open"]'))
          child.querySelector('a[data-toggle="open"]').setAttribute('aria-expanded', false);
      });
    }
  }

  function ChildonFocusChange(dropdownParent){
    let _this = this;
    let openDropdowns = Array.from(dropdownParent.parentElement.querySelectorAll('.dropdown.open'));
    let currentIndex = openDropdowns.indexOf(dropdownParent);
    openDropdowns.forEach((ele) => {
      let eleIndex = openDropdowns.indexOf(ele);
      if(eleIndex != currentIndex){ dropdownHide(ele); }
    });
  }
}

const allDropdowns = document.querySelectorAll('a[is="drop-down"]');
allDropdowns.forEach(function(ele) {
  dropDownInit(ele)
});

/**
 * Close SubMenu Dropdowns on Regular Nav Item fous or click
 *
 * @param {element} element - Dropdown element
 */
function defaultNavItem(element){
  let _this = element;
  ["focusin", "click", "mouseover", "mouseout"].forEach(function(type){
    _this.addEventListener(type, () => { hideDropdown(_this.parentElement); });
  });

  function hideDropdown(dropdownParent){
    let openDropdowns = Array.from(dropdownParent.parentElement.querySelectorAll('.dropdown.open'));
    openDropdowns.forEach((ele) => {
      ele.classList.remove('open');
      ele.querySelector('[is="drop-down"]').setAttribute('aria-expanded', false);
    });
  }
}

const allDefaultNav = document.querySelectorAll('a[is="simple-menu-item"]');
allDefaultNav.forEach(function(ele) {
  defaultNavItem(ele);
});

/**
   * Manage Newsletter Popup based on Cookie
   *
   */
 (function manageNewsletter() {
  const customerPosted = (window.location.href.search('[?&]customer_posted=true') !== -1);
  const $newsletterPopup = document.querySelector('#PopupModal-newsletter .modal');

  if(!$newsletterPopup){
    return;
  }

  const popupDelay = $newsletterPopup.dataset.popup_delay * 1000;
  const daysUntil = $newsletterPopup.dataset['period_until'];
  const newsletterPopupEnabled = Boolean($newsletterPopup.dataset['newsletter_enabled']);
  const newsletterPopupStatus = Utility.getCookie('newsletter_popup_status');
  const today = new Date();
  const expirationDate = new Date();
  expirationDate.setDate(today.getDate() + daysUntil);
  const time = expirationDate.getTime();
  const expireTime = time + 1000 * 36000;
  expirationDate.setTime(expireTime);
  
  // after registration get the 'customer_posted' parameter from URL
  // show popup after successful registration
  // the popup will have the 'Thank you' message after registration redirection
  if (customerPosted) {
    $newsletterPopup.classList.add('open');
    siteOverlay.prototype.showOverlay();
  }

  // do not show the popup if the disabled status cookie exists
  if (newsletterPopupStatus === 'disabled' || !newsletterPopupEnabled) {
    return;
  }

  setTimeout(() => {
    $newsletterPopup.classList.add('open');
    siteOverlay.prototype.showOverlay();
  }, popupDelay);

  let newsletterCloseBtn = document.querySelector('[data-newsletter-close-btn]');
  newsletterCloseBtn.addEventListener('click', () => {
    document.cookie = `newsletter_popup_status=disabled;expires=${expirationDate.toGMTString()};path=/`;
    $newsletterPopup.classList.remove('open');
    siteOverlay.prototype.hideOverlay();
  });
})();

/**
* Tab HTML
*/
class customTabs extends HTMLElement {
  constructor() {
    super();

    this.tabLinks = this.querySelectorAll('.tablink');
    this.tabContainers = this.querySelectorAll('.tabcontent');

    this.tabLinks.forEach( link => link.addEventListener('click', this.toggleTabs.bind(this)));
  }

  /**
   * Focus Out Event to close drawer
   *
   * @param {event} Event instance
   */
  focusOut(event){
    
  }

  /**
   * Escape Key Press to close drawer when focus is within the container
   *
   * @param {event} Event instance
   */
  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;
  }

  /**
   * Toggle Tabs on link click
   *
   * @param {event} Event instance
   */
  toggleTabs(event){
    event.preventDefault();
    event.stopPropagation();
    const currentTab = event.currentTarget;
    const tabLink = currentTab.querySelector('[data-toggle="tab"]');
    const tabContainer = document.querySelector(tabLink.dataset.tabcontent);

    this.openTab(currentTab, tabContainer)

    // let isOpen = currentTab.classList.contains('open');
    // isOpen ? this.closeTab(currentTab, tabContainer) : this.openTab(currentTab, tabContainer);
  }

  /**
   * Open Tab Container
   *
   * @param {Node} currentTab Tab Container Open link
   * @param {Node} tabContainer Tab Container to open
   */
  openTab(currentTab, tabContainer) {

    this.tabContainers.forEach(container => {
      container.classList.remove('open');
      const linkEle = document.querySelector('.tablink a[data-toggle="tab"][data-tabcontent="#'+container.id+'"]');
      if(linkEle){
        linkEle.setAttribute('aria-expanded', false);
        if(linkEle.closest('.tablink')){ linkEle.closest('.tablink').classList.remove('open');}
      }
    });
    currentTab.classList.add('open');
    currentTab.querySelector('[data-toggle="tab"]').setAttribute('aria-expanded', true);
    tabContainer.classList.add('open');
  }

  /**
   * Close Tab Container
   *
   * @param {Node} currentTab Tab Container link
   * @param {Node} tabContainer Tab Container to close
   */
  closeTab(currentTab, tabContainer) {
    currentTab.classList.remove('open');
    currentTab.querySelector('[data-toggle="tab"]').setAttribute('aria-expanded', false);
    tabContainer.classList.remove('open');
  }
}
customElements.define("custom-tabs", customTabs);

class ModalDialog extends HTMLElement {
  constructor() {
    super();

    if(this.querySelector('[id^="ModalClose-"]')){
      this.querySelector('[id^="ModalClose-"]').addEventListener(
        'click',
        this.hide.bind(this)
      );
    }

    this.addEventListener('click', (event) => {
      if (event.target.nodeName === 'MODAL-DIALOG') this.hide();
    });

    this.addEventListener('keyup', () => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
  }

  show(opener) {
    this.openedBy = opener;
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    this.querySelector('.modal').classList.add('modal-open');
    this.querySelector('.template-popup')?.loadContent();
    Utility.trapFocus(this, this.querySelector('[role="dialog"]'));
  }

  hide() {
    document.body.classList.remove('overflow-hidden');
    this.removeAttribute('open');
    this.querySelector('.modal').classList.remove('modal-open');
    Utility.removeTrapFocus(this.openedBy);
  }
}
customElements.define('modal-dialog', ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');
    button?.addEventListener('click', () => {
      document.querySelector(this.getAttribute('data-modal'))?.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

/**
* Website Overlay for Mobile Menu and Cart Drawer
*/
class siteOverlay extends HTMLElement{
  constructor() {
    super();

    this.menuDrawer = document.querySelector('#mobile-menu-drawer');
    this.cartDrawer = document.querySelector('ajax-cart.cart-drawer');
    this.bindEvents();
  }

  /**
   * bind Click and Touchend event to this custom component
   */
  bindEvents(){
    this.addEventListener('click', this.onClick.bind(this));
    this.addEventListener('touchend', this.onClick.bind(this));
  }

  /**
   * Click event of Site overlay
   * @param {event} Event instance performed
   */
  onClick(event){
    if(this.cartDrawer.classList.contains('opened-drawer')){
      document.querySelector('.close-ajax--cart').dispatchEvent(new Event('click'));
    }
    if(this.menuDrawer.classList.contains('opened-drawer')){
      document.querySelector('.close-mobile--navbar').dispatchEvent(new Event('click'));
    }
    this.hideOverlay();
  }

  /**
   * Show Overlay
   */
  showOverlay(){
    document.getElementById('site-overlay').classList.add('overlay--body');
    document.body.style.overflowY = "hidden";
    document.body.addEventListener('touchmove', bodyTouchMove, false);
  }

  /**
   * Hide overlay
   */
  hideOverlay(){
    document.getElementById('site-overlay').classList.remove('overlay--body');
    document.body.style.overflowY = "auto";
    document.body.removeEventListener('touchmove', bodyTouchMove, false);
  }
}
customElements.define("site-overlay", siteOverlay);

/**
* Mobile Navigation Drawer
*/
class MobileNavigation extends HTMLElement {
  constructor() {
    super();

    this.touchstartX = 0;
    this.touchendX = 0;

    this.openeBy = document.querySelector('#mobile-menu');
    this.closeBy = this.querySelector('.close-mobile--navbar');
    this.navDrawer = this.querySelector('#mobile-menu-drawer');
    this.bindEvents();
  }

  /**
   * Focus Out Event to close drawer
   *
   * @param {event} Event instance
   */
  focusOut(event){
    let isOpen = this.navDrawer.classList.contains('opened-drawer');
    if (! this.contains(event.relatedTarget) && isOpen == true) {
      this.querySelector('.close-mobile--navbar').dispatchEvent(new Event('click'));
    }
  }

  /**
   * Escape Key Press to close drawer when focus is within the container
   *
   * @param {event} Event instance
   */
  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;
    this.querySelector('.close-mobile--navbar').dispatchEvent(new Event('click'));
  }

  /**
   * bind click event to Menu Icon 
   * bind keyup event to Menu Drawer component
   */
  bindEvents() {
    this.openeBy.addEventListener('click', this.openMenuDrawer.bind(this));
    this.closeBy.addEventListener('click', this.closeMenuDrawer.bind(this));
    this.addEventListener('keyup', this.onKeyUp.bind(this));
    // this.openeBy.addEventListener('focusout', this.focusOut.bind(this));
  }

  /**
   * Open Menu Drawer
   *
   * @param {event} Event instance
   */
  openMenuDrawer(event) {
    this.navDrawer.classList.add('opened-drawer');
    siteOverlay.prototype.showOverlay();
    if(document.querySelector('ajax-cart.cart-drawer').classList.contains('opened-drawer')){
      document.querySelector('.close-ajax--cart').dispatchEvent(new Event('click'));
    }
    if(event){
      event.preventDefault();
      let openBy = event.currentTarget;
      openBy.setAttribute('aria-expanded', true);
      Utility.trapFocus(this.navDrawer, this.querySelector('.mobile-header--logo'));
      Utility.forceFocus(this.querySelector('.mobile-header--logo'));
    }
  }

  /**
   * Close Menu Drawer
   *
   * @param {event} Event instance
   */
  closeMenuDrawer(event, elementToFocus = false) {
    if (event !== undefined) {
      event.preventDefault();
      this.navDrawer.classList.remove('opened-drawer');
      siteOverlay.prototype.hideOverlay();
      this.openeBy.setAttribute('aria-expanded', false);
      Utility.forceFocus(this.openeBy);
    }
  }

  /**
   * To get User Touch action pattern (Swipe Left / Swipe Right)
   *
   */
  handleGesture() {
    if (this.touchendX < this.thistouchstartX)
      this.openeBy.dispatchEvent(new Event('click'));
    if (this.touchendX > this.touchstartX)
      this.closeBy.dispatchEvent(new Event('click'));
  }
}
customElements.define("mobile-nav", MobileNavigation);

/**
 * Slider Component
 *
 */
 class sliderElement extends HTMLElement{
  constructor() {
    super();
    let sliderElement = this.querySelector('.swiper-slider');
    let sliderOptions = sliderElement.getAttribute('data-slider');
    let thumbSlider;
    sliderOptions = JSON.parse(sliderOptions);

    // Set up nav slider 
    if(sliderElement.hasAttribute('data-nav')){
      let thumbSlider = document.querySelector('.'+sliderElement.getAttribute('data-nav'));
      if(!thumbSlider){
        return;
      }
      let thumbSliderOptions = thumbSlider.getAttribute('data-slider');
      thumbSliderOptions = JSON.parse(thumbSliderOptions);
      thumbSlider = new Swiper(thumbSlider, thumbSliderOptions);

      sliderOptions.thumbs = {
        swiper: thumbSlider
      }
    }

    let slider = new Swiper(sliderElement, sliderOptions);
    if(sliderElement.classList.contains('pdp-carousel')){
      productSlider = slider;
    }
    if(sliderElement.hasAttribute('data-nav') && thumbSlider){
      thumbSlider.controller.control = slider;
    }
  }
}
customElements.define('slider-element', sliderElement);

