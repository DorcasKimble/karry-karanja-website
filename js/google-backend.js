(() => {
  const CONFIG = {
    CLIENT_ID: '577321300623-bibhl8n6nntpt60pkv8n18mmfplsc994.apps.googleusercontent.com',
    ENDPOINT: 'https://script.google.com/macros/s/AKfycbyrUWZvH2zFLsvuOBEKQ738627dd73kKhbliFoCJVsaEbO8JBKFjNJsMiEX4pBs40uNDw/exec'
  };

  let idToken = sessionStorage.getItem('kk_google_id_token') || '';

  async function request(action, extra = {}) {
    if (!idToken) {
      throw new Error('Please sign in with Google first.');
    }

    const response = await fetch(CONFIG.ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8'
      },
      body: JSON.stringify({
        action,
        idToken,
        ...extra
      })
    });

    if (!response.ok) {
      throw new Error(`Backend request failed (${response.status}).`);
    }

    return response.json();
  }

  function isSignedIn() {
    return !!idToken;
  }

  function setToken(token) {
    idToken = token || '';

    if (idToken) {
      sessionStorage.setItem('kk_google_id_token', idToken);
    } else {
      sessionStorage.removeItem('kk_google_id_token');
    }
  }

  function clearToken() {
    setToken('');
  }

  async function handleCredentialResponse(response) {
    try {
      setToken(response.credential);

      const result = await request('getProfile', {
        logSignIn: true
      });

      if (!result || !result.ok) {
        throw new Error(
          result?.error || 'Google sign-in failed.'
        );
      }

      document.dispatchEvent(
        new CustomEvent('kk-google-signed-in', {
          detail: result.user
        })
      );

      if (window.kkGoogleAuth) {
        window.kkGoogleAuth.updateUI(result.user);
      }

    } catch (err) {
      clearToken();

      console.error('Google sign-in error:', err);

      if (window.kkGoogleAuth) {
        window.kkGoogleAuth.showMessage(
          err.message || 'Google sign-in failed.'
        );
      }
    }
  }

  window.kkGoogleBackend = {
    CONFIG,
    request,
    isSignedIn,
    setToken,
    clearToken,
    handleCredentialResponse
  };

  function initializeGoogleSignIn() {

    if (
      !window.google ||
      !window.google.accounts ||
      !window.google.accounts.id
    ) {
      return;
    }

    google.accounts.id.initialize({
      client_id: CONFIG.CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false
    });

    const target =
      document.getElementById('googleSignInButton');

    if (target) {

      target.innerHTML = '';

      google.accounts.id.renderButton(
        target,
        {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: 320
        }
      );
    }
  }

  window.addEventListener('load', () => {

    if (
      window.google &&
      window.google.accounts &&
      window.google.accounts.id
    ) {
      initializeGoogleSignIn();
      return;
    }

    const timer = setInterval(() => {

      if (
        window.google &&
        window.google.accounts &&
        window.google.accounts.id
      ) {
        clearInterval(timer);
        initializeGoogleSignIn();
      }

    }, 100);

    setTimeout(() => {
      clearInterval(timer);
    }, 10000);

  });

})();
