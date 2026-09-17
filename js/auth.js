(() => {
  const sb = window.kkSupabase;
  const $ = (id) => document.getElementById(id);
  const modal = $('authModal');
  const form = $('authForm');
  const title = $('authTitle');
  const submit = $('authSubmit');
  const message = $('authMessage');
  const modeText = $('authModeText');
  let mode = 'login';

  function openAuth(nextMode = 'login') {
    mode = nextMode;
    title.textContent = mode === 'login' ? 'Log in to your savings plan' : 'Create your savings account';
    submit.textContent = mode === 'login' ? 'Log in' : 'Create account';
    modeText.innerHTML = mode === 'login'
      ? `New here? <button type="button" class="auth-link" id="switchAuth">Create an account</button>`
      : `Already have an account? <button type="button" class="auth-link" id="switchAuth">Log in</button>`;
    message.textContent = '';
    form.reset();
    modal.classList.add('open');
    $('authEmail').focus();
    $('switchAuth').onclick = () => openAuth(mode === 'login' ? 'signup' : 'login');
  }

  function closeAuth() { modal.classList.remove('open'); }

  $('loginBtn').onclick = () => openAuth('login');
  $('signupBtn').onclick = () => openAuth('signup');
  $('authClose').onclick = closeAuth;
  modal.addEventListener('click', e => { if (e.target === modal) closeAuth(); });

  $('logoutBtn').onclick = async () => { await sb.auth.signOut(); };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('authEmail').value.trim();
    const password = $('authPassword').value;
    submit.disabled = true;
    message.textContent = 'Please wait…';
    try {
      if (mode === 'signup') {
        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.href }
        });
        if (error) throw error;
        if (data.user) {
          if (data.session) {
            await sb.from('profiles').upsert({ user_id: data.user.id, full_name: null }, { onConflict: 'user_id' });
            message.textContent = 'Account created. You are now signed in.';
          } else {
            message.textContent = 'Account created. Check your email to confirm your account, then return here to log in.';
          }
        }
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        message.textContent = 'Logged in successfully.';
        setTimeout(closeAuth, 500);
      }
    } catch (err) {
      message.textContent = err?.message || 'Something went wrong. Please try again.';
    } finally {
      submit.disabled = false;
    }
  });

  async function updateAuthUI() {
    const { data: { session } } = await sb.auth.getSession();
    const loggedIn = !!session;
    $('loginBtn').hidden = loggedIn;
    $('signupBtn').hidden = loggedIn;
    $('logoutBtn').hidden = !loggedIn;
    $('authStatus').textContent = loggedIn ? `Signed in as ${session.user.email}` : '';
  }

  sb.auth.onAuthStateChange(() => updateAuthUI());
  updateAuthUI();
})();
