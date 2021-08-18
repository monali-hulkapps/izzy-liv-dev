const selectors = {
    customerAddresses: '[data-customer-addresses]',
    addressCountrySelect: '[data-address-country-select]',
    toggleAddressButton: '[data-edit-address]',
    cancelAddressButton: '[data-reset-address]',
    deleteAddressButton: '[data-confirm-message]'
  };
  
  const attributes = {
    confirmMessage: 'data-confirm-message'
  };
  
  class CustomerAddresses {
    constructor() {
      this.elements = this._getElements();
      if (Object.keys(this.elements).length === 0) return;
      this._setupCountries();
      this._setupEventListeners();
    }
  
    _getElements() {
      const container = document.querySelector(selectors.customerAddresses);
      return container ? {
        container,
        newAddressForm: document.querySelector(selectors.newAddressButton),
        editAddressToggle: document.querySelectorAll(selectors.toggleAddressButton),
        cancelButtons: container.querySelectorAll(selectors.cancelAddressButton),
        deleteButtons: container.querySelectorAll(selectors.deleteAddressButton),
        countrySelects: container.querySelectorAll(selectors.addressCountrySelect)
      } : {};
    }
  
    _setupCountries() {
      if (Shopify && Shopify.CountryProvinceSelector) {
        // eslint-disable-next-line no-new
        new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
          hideElement: 'AddressProvinceContainerNew'
        });
        this.elements.countrySelects.forEach((select) => {
          const formId = select.dataset.formId;
          if(!document.getElementById(`AddressCountry_${formId}`)) return;
          // eslint-disable-next-line no-new
          new Shopify.CountryProvinceSelector(`AddressCountry_${formId}`, `AddressProvince_${formId}`, {
            hideElement: `AddressProvinceContainer_${formId}`
          });
        });
      }
    }
  
    _setupEventListeners() {
        this.elements.editAddressToggle.forEach((element) => {
            element.addEventListener('click', this._handleToggleForm.bind(this));
        });
        this.elements.cancelButtons.forEach((element) => {
            element.addEventListener('click', this._handleCancelButtonClick.bind(this));
        });
        this.elements.deleteButtons.forEach((element) => {
            element.addEventListener('click', this._handleDeleteButtonClick);
        });
    }

    _handleToggleForm = (event) => {
        event.preventDefault();
        let formToggleContainer = document.querySelector('[data-editAddressContainer]');
        const addNewAddress = document.querySelector('[data-newAddressContainer]');
        const currentTarget = event.currentTarget;
        const targetFormID = currentTarget.dataset.target;
        const targetForm = document.querySelector(targetFormID);
        const formType = currentTarget.dataset.for;
        if(formType == 'add_address') formToggleContainer = addNewAddress;
        
        if(!targetForm) return;

        let isOpen = targetForm.classList.contains('open');
        if(isOpen){
            Utility.toggleElement(formToggleContainer, 'close');
            currentTarget.setAttribute('aria-expanded', false);
            targetForm.removeAttribute('data-type');
        }else{
            this._hideOpenforms();
            setTimeout(() => {
                currentTarget.setAttribute('aria-expanded', true);
                targetForm.setAttribute('data-type', 'content');
                Utility.toggleElement(formToggleContainer, 'open');
            }, 500);
        }
    }

    _hideOpenforms(){
        // Close Opened Edit Address Forms
        const container = document.querySelector('[data-editAddressContainer]');
        let allForms = container.querySelectorAll('.customer-form.open');
        let toggleButtons = document.querySelectorAll('[data-edit-address][aria-expanded="true"]');
        toggleButtons.forEach(button => { button.setAttribute('aria-expanded', false); })
        allForms.forEach(form => { Utility.toggleElement(container, 'close'); form.removeAttribute('data-type'); });

        // Close Add new Address Forms
        let newAddForm = document.querySelector('[data-newAddressContainer]');
        Utility.toggleElement(newAddForm, 'close');
    }

    _handleCancelButtonClick = (event) => {
        event.preventDefault();
        this._hideOpenforms();
    }

    _handleDeleteButtonClick = ({ currentTarget }) => {
      // eslint-disable-next-line no-alert
      if (confirm(currentTarget.getAttribute(attributes.confirmMessage))) {
        Shopify.postLink(currentTarget.dataset.target, {
          parameters: { _method: 'delete' },
        });
      }
    }
}
window.onload = () => {
    typeof CustomerAddresses !== 'undefined' && new CustomerAddresses();
}