const selectors = {
    accountPages: '[data-account-pages]',
    resetPassword : '[data-recover-link]',
    hideResetPass : '[data-hideResetPass]',
    resetPasswordForm : '[data-reset-password-form]',
    loginForm : '[data-login-form]'
  };

  class accountPages {
    constructor() {
      this.elements = this._getElements();
      if (Object.keys(this.elements).length === 0) return;
      this._setupEventListeners();
    }
  
    _getElements() {
      const container = document.querySelector(selectors.accountPages);
      return container ? {
        container,
        showResetPassword: document.querySelector(selectors.resetPassword),
        hideResetPass: document.querySelector(selectors.hideResetPass),
        resetPasswordForm: document.querySelector(selectors.resetPasswordForm),
        loginForm: document.querySelector(selectors.loginForm)
      } : {};
    }
  
    _setupEventListeners() {
        this.elements.showResetPassword.addEventListener('click', this._handleResetPassword.bind(this));
        this.elements.hideResetPass.addEventListener('click', this._handleResetPassword.bind(this));
    }

    _handleResetPassword(event){
        event.preventDefault();
        const _this = event.currentTarget;
        if(_this.classList.contains('hide-resetform')){
            this.elements.loginForm.style.display = 'block';
            this.elements.resetPasswordForm.style.display = 'none';
        }else{
            this.elements.loginForm.style.display = 'none';
            this.elements.resetPasswordForm.style.display = 'block';
        }
    }
}

window.onload = () => {
    typeof accountPages !== 'undefined' && new accountPages();
}