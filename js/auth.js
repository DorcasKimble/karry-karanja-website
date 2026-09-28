(() => {

  const api = window.kkGoogleBackend;

  const $ = id => document.getElementById(id);

  const modal = $('authModal');
  const message = $('authMessage');

  let authMode = 'login';


  /* -----------------------------------------
     OPEN LOGIN
  ----------------------------------------- */

  function openLogin() {

    authMode = 'login';

    const title = $('authTitle');
    const subtitle = $('authSubtitle');
    const eyebrow = $('authEyebrow');

    if (eyebrow) {
      eyebrow.textContent = 'Welcome back';
    }

    if (title) {
      title.textContent = 'Log in to your savings plan';
    }

    if (subtitle) {
      subtitle.textContent =
        'Log in using the Google account connected to your savings plan.';
    }

    showMessage('');

    openModal();
  }


  /* -----------------------------------------
     OPEN SIGN UP
  ----------------------------------------- */

  function openSignup() {

    authMode = 'signup';

    const title = $('authTitle');
    const subtitle = $('authSubtitle');
    const eyebrow = $('authEyebrow');

    if (eyebrow) {
      eyebrow.textContent = 'Create your savings account';
    }

    if (title) {
      title.textContent = 'Sign up for your savings plan';
    }

    if (subtitle) {
      subtitle.textContent =
        'First-time users can sign up with Google. Your Google account verifies your email address during sign-in.';
    }

    showMessage('');

    openModal();
  }


  /* -----------------------------------------
     OPEN / CLOSE MODAL
  ----------------------------------------- */

  function openModal() {

    if (!modal) return;

    modal.classList.add('open');

    modal.setAttribute('aria-hidden', 'false');

  }


  function closeModal() {

    if (!modal) return;

    modal.classList.remove('open');

    modal.setAttribute('aria-hidden', 'true');

  }


  /* -----------------------------------------
     DISPLAY LOGIN STATE
  ----------------------------------------- */

  function updateUI(user) {

    const loggedIn =
      !!user ||
      (api && api.isSignedIn());


    const loginBtn = $('loginBtn');
    const signupBtn = $('signupBtn');
    const logoutBtn = $('logoutBtn');
    const authStatus = $('authStatus');


    if (loginBtn) {
      loginBtn.hidden = loggedIn;
    }


    if (signupBtn) {
      signupBtn.hidden = loggedIn;
    }


    if (logoutBtn) {
      logoutBtn.hidden = !loggedIn;
    }


    if (authStatus) {

      authStatus.textContent =
        user?.email
          ? `Signed in as ${user.email}`
          : '';

    }


    if (loggedIn) {
      closeModal();
    }

  }


  /* -----------------------------------------
     AUTH MESSAGE
  ----------------------------------------- */

  function showMessage(text) {

    if (message) {
      message.textContent = text || '';
    }

  }


  /* -----------------------------------------
     PUBLIC AUTH API
  ----------------------------------------- */

  window.kkGoogleAuth = {
    updateUI,
    showMessage,
    openLogin,
    openSignup,
    openAuth: openLogin
  };


  /* -----------------------------------------
     LOGIN BUTTON
  ----------------------------------------- */

  const loginBtn = $('loginBtn');

  if (loginBtn) {

    loginBtn.addEventListener('click', () => {

      openLogin();

    });

  }


  /* -----------------------------------------
     SIGN UP BUTTON
  ----------------------------------------- */

  const signupBtn = $('signupBtn');

  if (signupBtn) {

    signupBtn.addEventListener('click', () => {

      openSignup();

    });

  }


  /* -----------------------------------------
     CLOSE BUTTON
  ----------------------------------------- */

  const closeBtn = $('authClose');

  if (closeBtn) {

    closeBtn.addEventListener('click', () => {

      closeModal();

    });

  }


  /* -----------------------------------------
     CLICK OUTSIDE MODAL TO CLOSE
  ----------------------------------------- */

  if (modal) {

    modal.addEventListener('click', event => {

      if (event.target === modal) {

        closeModal();

      }

    });

  }


  /* -----------------------------------------
     LOG OUT
  ----------------------------------------- */

  const logoutBtn = $('logoutBtn');

  if (logoutBtn) {

    logoutBtn.addEventListener('click', () => {

      if (api) {
        api.clearToken();
      }


      if (
        window.google &&
        window.google.accounts &&
        window.google.accounts.id
      ) {

        google.accounts.id.disableAutoSelect();

      }


      updateUI(null);


      document.dispatchEvent(
        new Event('kk-google-signed-out')
      );

    });

  }


  /* -----------------------------------------
     RESTORE EXISTING LOGIN
  ----------------------------------------- */

  if (api && api.isSignedIn()) {

    updateUI({
      email: 'Google account'
    });


    api.request('getProfile')

      .then(response => {

        if (response && response.ok) {

          updateUI(response.user);


          document.dispatchEvent(
            new CustomEvent(
              'kk-google-signed-in',
              {
                detail: response.user
              }
            )
          );

        } else {

          api.clearToken();

          updateUI(null);

        }

      })

      .catch(() => {

        api.clearToken();

        updateUI(null);

      });

  } else {

    updateUI(null);

  }

})();
