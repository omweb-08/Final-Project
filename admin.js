// public/js/admin.js - for admin.html

async function adminLogin(e) {
  e.preventDefault();
  const msg = document.getElementById('adminMsg');
  msg.textContent = '';
  const user = document.getElementById('adminUser').value;
  const pass = document.getElementById('adminPass').value;
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ username: user, password: pass })
    });
    const j = await res.json();
    if (j.success) {
      // switch to dashboard view
      document.getElementById('loginBox').style.display = 'none';
      document.getElementById('dashboard').style.display = 'block';
      loadSubmissions();
    } else {
      msg.textContent = j.message || 'Login failed';
    }
  } catch (err) {
    console.error(err);
    msg.textContent = 'Server error';
  }
}

async function loadSubmissions() {
  const list = document.getElementById('subList');
  list.innerHTML = 'Loading...';
  try {
    const res = await fetch('/api/admin/submissions');
    if (res.status === 401) {
      // not logged in, show login
      document.getElementById('loginBox').style.display = 'block';
      document.getElementById('dashboard').style.display = 'none';
      return;
    }
    const j = await res.json();
    if (!j.success) { list.innerHTML = 'Error loading'; return; }
    const subs = j.submissions;
    if (!subs.length) { list.innerHTML = '<div class="card">No submissions yet.</div>'; return; }
    list.innerHTML = subs.map(s => `
      <div class="card" style="margin-bottom:12px;padding:12px">
        <div><strong>${escapeHtml(s.name)}</strong> — <small>${new Date(s.createdAt).toLocaleString()}</small></div>
        <div><strong>Phone:</strong> ${escapeHtml(s.phone || '')}</div>
        <div><strong>Email:</strong> ${escapeHtml(s.email || '')}</div>
        <div style="margin-top:8px">${escapeHtml(s.message)}</div>
        <div style="margin-top:8px"><button onclick="deleteSubmission('${s._id}')" class="btn btn-light">Delete</button></div>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
    list.innerHTML = 'Server error';
  }
}

async function deleteSubmission(id) {
  if (!confirm('Delete this submission?')) return;
  try {
    const res = await fetch('/api/admin/submissions/' + id, { method: 'DELETE' });
    const j = await res.json();
    if (j.success) {
      loadSubmissions();
    } else {
      alert(j.message || 'Delete failed');
    }
  } catch (err) {
    console.error(err);
    alert('Server error');
  }
}

// escape HTML helper
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]);
  });
}

// Hook login form
document.addEventListener('DOMContentLoaded', () => {
  const lf = document.getElementById('adminLoginForm');
  if (lf) lf.addEventListener('submit', adminLogin);
});
