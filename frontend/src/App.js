import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api/employees').replace(/\/+$/, '');

const emptyForm = {
  employeeId: '',
  fullName: '',
  gender: 'Nam',
  dateOfBirth: '',
  department: '',
  position: '',
  email: '',
  phone: '',
  hireDate: '',
  status: 'Dang lam viec'
};

function App() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchEmployees = async (keyword = '') => {
    setLoading(true);
    try {
      const { data } = await axios.get(API_URL, {
        params: keyword.trim() ? { search: keyword.trim() } : {}
      });
      setEmployees(data);
    } catch (error) {
      setNotice({
        type: 'error',
        text: error.response?.data?.message || 'Không thể tải danh sách. Hãy kiểm tra kết nối API.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormData({ ...emptyForm });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
        setNotice({ type: 'success', text: 'Đã cập nhật hồ sơ nhân viên.' });
      } else {
        await axios.post(API_URL, formData);
        setNotice({ type: 'success', text: 'Đã thêm hồ sơ nhân viên.' });
      }
      resetForm();
      await fetchEmployees(search);
    } catch (error) {
      setNotice({
        type: 'error',
        text: error.response?.data?.message || 'Thao tác thất bại. Vui lòng thử lại.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingId(employee._id);
    setFormData(Object.keys(emptyForm).reduce((form, key) => ({
      ...form,
      [key]: employee[key] || (key === 'gender' ? 'Nam' : key === 'status' ? 'Dang lam viec' : '')
    }), {}));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (employee) => {
    if (!window.confirm(`Xóa hồ sơ của ${employee.fullName}?`)) return;
    try {
      await axios.delete(`${API_URL}/${employee._id}`);
      setNotice({ type: 'success', text: `Đã xóa hồ sơ ${employee.employeeId}.` });
      if (editingId === employee._id) resetForm();
      await fetchEmployees(search);
    } catch (error) {
      setNotice({
        type: 'error',
        text: error.response?.data?.message || 'Không thể xóa hồ sơ nhân viên.'
      });
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    fetchEmployees(search);
  };

  const handleClearSearch = () => {
    setSearch('');
    fetchEmployees('');
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Trang chủ quản lý nhân sự">
          <span className="brand-mark" aria-hidden="true">N</span>
          <span>NHÂN SỰ <b>/ 237451</b></span>
        </a>
        <span className="topbar-caption">HỆ THỐNG QUẢN LÝ NỘI BỘ</span>
      </header>

      <section className="page-heading">
        <div>
          <p className="eyebrow">NHÂN SỰ / HỒ SƠ</p>
          <h1>Quản lý nhân viên</h1>
          <p className="heading-copy">Theo dõi và cập nhật thông tin đội ngũ của bạn.</p>
        </div>
        <div className="staff-count" aria-live="polite">
          <span className="count-number">{employees.length.toString().padStart(2, '0')}</span>
          <span>NHÂN VIÊN</span>
        </div>
      </section>

      {notice && (
        <div className={`notice notice-${notice.type}`} role="status">
          <span>{notice.text}</span>
          <button type="button" className="notice-dismiss" onClick={() => setNotice(null)} aria-label="Đóng thông báo">×</button>
        </div>
      )}

      <section className="workspace" aria-label="Quản lý hồ sơ nhân viên">
        <aside className="form-panel">
          <div className="section-title">
            <div>
              <p className="eyebrow">HỒ SƠ</p>
              <h2>{editingId ? 'Cập nhật nhân viên' : 'Thêm nhân viên'}</h2>
            </div>
            {editingId && <span className="edit-indicator">ĐANG SỬA</span>}
          </div>

          <form className="employee-form" onSubmit={handleSubmit}>
            <label>
              Mã nhân viên <span className="required">*</span>
              <input name="employeeId" value={formData.employeeId} onChange={handleChange} placeholder="VD: NV001" required disabled={Boolean(editingId)} />
            </label>
            <label>
              Họ và tên <span className="required">*</span>
              <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nhập họ tên" required />
            </label>
            <div className="field-row">
              <label>
                Giới tính
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="Nam">Nam</option>
                  <option value="Nu">Nữ</option>
                  <option value="Khac">Khác</option>
                </select>
              </label>
              <label>
                Ngày sinh
                <input name="dateOfBirth" type="date" value={formData.dateOfBirth?.slice(0, 10) || ''} onChange={handleChange} />
              </label>
            </div>
            <div className="field-row">
              <label>
                Phòng ban
                <input name="department" value={formData.department} onChange={handleChange} placeholder="VD: Kinh doanh" />
              </label>
              <label>
                Chức vụ
                <input name="position" value={formData.position} onChange={handleChange} placeholder="VD: Chuyên viên" />
              </label>
            </div>
            <label>
              Email <span className="required">*</span>
              <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="ten@congty.vn" required />
            </label>
            <div className="field-row">
              <label>
                Số điện thoại
                <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="09xx xxx xxx" />
              </label>
              <label>
                Ngày vào làm
                <input name="hireDate" type="date" value={formData.hireDate?.slice(0, 10) || ''} onChange={handleChange} />
              </label>
            </div>
            <label>
              Trạng thái
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="Dang lam viec">Đang làm việc</option>
                <option value="Tam nghi">Tạm nghỉ</option>
                <option value="Da nghi viec">Đã nghỉ việc</option>
              </select>
            </label>
            <div className="form-actions">
              <button type="submit" className="button button-primary" disabled={saving}>
                {saving ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Thêm hồ sơ'}
              </button>
              {editingId && <button type="button" className="button button-secondary" onClick={resetForm}>Hủy</button>}
            </div>
          </form>
        </aside>

        <section className="directory-panel" aria-labelledby="directory-title">
          <div className="directory-heading">
            <div>
              <p className="eyebrow">DANH BẠ</p>
              <h2 id="directory-title">Danh sách nhân viên</h2>
            </div>
            <span className="result-count">{employees.length} kết quả</span>
          </div>

          <form className="search-form" onSubmit={handleSearch} role="search">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Tìm theo mã hoặc họ tên..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Tìm theo mã nhân viên hoặc họ tên"
            />
            {search && <button type="button" className="clear-search" onClick={handleClearSearch}>Xóa lọc</button>}
            <button type="submit" className="button button-search">Tìm kiếm</button>
          </form>

          <div className="table-wrap">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Mã NV</th>
                  <th>Nhân viên</th>
                  <th>Phòng ban</th>
                  <th>Chức vụ</th>
                  <th>Email</th>
                  <th>Điện thoại</th>
                  <th>Trạng thái</th>
                  <th><span className="visually-hidden">Thao tác</span></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="table-message" colSpan="8"><span className="loader" /> Đang tải danh sách...</td></tr>
                ) : employees.length ? employees.map((employee) => (
                  <tr key={employee._id}>
                    <td className="employee-code">{employee.employeeId}</td>
                    <td>
                      <button type="button" className="employee-name" onClick={() => setViewingEmployee(employee)}>{employee.fullName}</button>
                    </td>
                    <td>{employee.department || '—'}</td>
                    <td>{employee.position || '—'}</td>
                    <td><a className="email-link" href={`mailto:${employee.email}`}>{employee.email}</a></td>
                    <td>{employee.phone || '—'}</td>
                    <td><span className={`status-pill ${employee.status === 'Dang lam viec' ? 'status-active' : 'status-inactive'}`}>{employee.status || 'Chưa cập nhật'}</span></td>
                    <td>
                      <div className="row-actions">
                        <button type="button" className="text-action" onClick={() => handleEdit(employee)}>Sửa</button>
                        <button type="button" className="text-action text-danger" onClick={() => handleDelete(employee)}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td className="table-message empty-message" colSpan="8">{search ? 'Không tìm thấy nhân viên phù hợp.' : 'Chưa có hồ sơ nhân viên.'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span>HIỂN THỊ {employees.length} HỒ SƠ</span>
            <span>237451 / NHÂN SỰ</span>
          </div>
        </section>
      </section>

      {viewingEmployee && (
        <div className="modal-backdrop" role="presentation" onClick={() => setViewingEmployee(null)}>
          <section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-heading">
              <div><p className="eyebrow">HỒ SƠ NHÂN VIÊN</p><h2 id="detail-title">{viewingEmployee.fullName}</h2></div>
              <button type="button" className="modal-close" onClick={() => setViewingEmployee(null)} aria-label="Đóng">×</button>
            </div>
            <dl className="detail-grid">
              <div><dt>Mã nhân viên</dt><dd>{viewingEmployee.employeeId}</dd></div>
              <div><dt>Trạng thái</dt><dd>{viewingEmployee.status || 'Chưa cập nhật'}</dd></div>
              <div><dt>Giới tính</dt><dd>{viewingEmployee.gender || '—'}</dd></div>
              <div><dt>Ngày sinh</dt><dd>{viewingEmployee.dateOfBirth || '—'}</dd></div>
              <div><dt>Phòng ban</dt><dd>{viewingEmployee.department || '—'}</dd></div>
              <div><dt>Chức vụ</dt><dd>{viewingEmployee.position || '—'}</dd></div>
              <div><dt>Email</dt><dd>{viewingEmployee.email || '—'}</dd></div>
              <div><dt>Số điện thoại</dt><dd>{viewingEmployee.phone || '—'}</dd></div>
              <div><dt>Ngày vào làm</dt><dd>{viewingEmployee.hireDate || '—'}</dd></div>
            </dl>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;