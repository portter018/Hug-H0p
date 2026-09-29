const STATUS = {
  pending:   { label: 'รอยืนยัน',       next: 'confirmed', btn: 'ยืนยัน' },
  confirmed: { label: 'ยืนยันแล้ว',      next: 'inservice', btn: 'เริ่มให้บริการ' },
  inservice: { label: 'กำลังให้บริการ',  next: 'done',      btn: 'เสร็จสิ้น' },
  done:      { label: 'เสร็จสิ้น' },
  cancelled: { label: 'ยกเลิก' },
};
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

let currentDate = iso(new Date());
let filter = 'all';
let rows = [];

async function guard() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) return location.replace('login.html');
  const { data: p } = await db.from('profiles').select('username, role').eq('id', session.user.id).single();
  if (!p || p.role !== 'admin') {
    await db.auth.signOut();
    return location.replace('login.html');
  }
  $('userName').textContent = (p.username || 'Admin') + ' (Admin)';
  $('userAvatar').textContent = (p.username || 'A').charAt(0).toUpperCase();
  load();
}

async function load() {
  $('dateInput').value = currentDate;
  $('dateTitle').textContent = new Date(currentDate).toLocaleDateString('th-TH',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const { data, error } = await db.from('bookings')
    .select('id, service, booking_time, status, pets(name, breed), profiles(username, phone)')
    .eq('booking_date', currentDate)
    .order('booking_time');
  if (error) { console.error(error); rows = []; } else rows = data;
  render();
}

function render() {
  const count = s => rows.filter(r => r.status === s).length;
  $('statRow').innerHTML = [
    ['คิวทั้งหมด', rows.length], ['รอยืนยัน', count('pending')],
    ['กำลังให้บริการ', count('inservice')], ['เสร็จสิ้น', count('done')],
  ].map(([l, v]) => `<div class="stat"><p class="stat__label">${l}</p><p class="stat__value">${v}</p></div>`).join('');

  const list = filter === 'all' ? rows : rows.filter(r => r.status === filter);
  $('boardEmpty').hidden = list.length > 0;
  $('queueBody').innerHTML = list.map(r => {
    const s = STATUS[r.status];
    return `<tr>
      <td>${esc(r.booking_time.slice(0, 5))}</td>
      <td><strong>${esc(r.profiles?.username)}</strong><br>
          <small>${esc(r.pets?.name)}${r.pets?.breed ? ' · ' + esc(r.pets.breed) : ''}</small></td>
      <td>${esc(r.service)}</td>
      <td><span class="status status--${r.status}">${s.label}</span></td>
      <td>${s.next ? `<button data-id="${r.id}" data-to="${s.next}">${s.btn}</button>` : ''}
          ${['pending', 'confirmed'].includes(r.status) ? `<button data-id="${r.id}" data-to="cancelled">ยกเลิก</button>` : ''}</td>
    </tr>`;
  }).join('');
}

async function setStatus(id, to) {
  const { error } = await db.from('bookings').update({ status: to }).eq('id', id);
  if (error) return alert('อัปเดตไม่สำเร็จ: ' + error.message);
  load();
}

$('queueBody').addEventListener('click', e => {
  const b = e.target.closest('button[data-id]');
  if (b) setStatus(b.dataset.id, b.dataset.to);
});
$('filterTabs').addEventListener('click', e => {
  const t = e.target.closest('.filter-tab'); if (!t) return;
  filter = t.dataset.filter;
  document.querySelectorAll('.filter-tab').forEach(x => x.classList.toggle('is-active', x === t));
  render();
});
const shift = n => { const d = new Date(currentDate); d.setDate(d.getDate() + n); currentDate = iso(d); load(); };
$('prevDay').onclick = () => shift(-1);
$('nextDay').onclick = () => shift(1);
$('dateInput').onchange = e => { currentDate = e.target.value || currentDate; load(); };
$('logoutBtn').onclick = async e => { e.preventDefault(); await db.auth.signOut(); location.replace('login.html'); };

guard();