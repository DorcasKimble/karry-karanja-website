(() => {

  const api = window.kkGoogleBackend;

  const $ = (id) => document.getElementById(id);

  const modal = $('authModal');

  const message = $('authMessage');


  function openAuth() {

    if (!modal) return;

    modal.classList.add('open');

    modal.setAttribute('aria-hidden', 'false');

  }


  function closeAuth() {

    if (!modal) return;

    modal.classList.remove('open');

    modal.setAttribute('aria-hidden', 'true');

  }


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
      closeAuth();
    }

  }


  function showMessage(text) {

    if (message) {
      message.textContent = text || '';
    }

  }


  window.kkGoogleAuth = {
    updateUI,
    showMessage,
    openAuth
  };


  const loginBtn = $('loginBtn');

  const signupBtn = $('signupBtn');

  const logoutBtn = $('logoutBtn');

  const authClose = $('authClose');


  if (loginBtn) {
    loginBtn.onclick = openAuth;
  }


  if (signupBtn) {
    signupBtn.onclick = openAuth;
  }


  if (authClose) {
    authClose.onclick = closeAuth;
  }


  if (modal) {

    modal.addEventListener('click', (event) => {

      if (event.target === modal) {
        closeAuth();
      }

    });

  }


  if (logoutBtn) {

    logoutBtn.onclick = () => {

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

    };

  }


  // Restore the existing Google session if possible.
  if (api && api.isSignedIn()) {

    updateUI({
      email: 'Google account'
    });


    api.request('getProfile')
      .then((response) => {

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
