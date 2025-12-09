export default function SettingsPage() {
  return (
    <div>
      <h1>⚙️ Settings</h1>

      <div
        style={{
          marginTop: 20,
          padding: 20,
          backgroundColor: 'white',
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <h3>📝 Example: Regular Static Route</h3>
        <code>modules/admin/pages/settings.tsx</code>
        <p style={{ marginTop: 10, color: '#6b7280' }}>
          This file creates the route: <strong>/admin/settings</strong>
        </p>
      </div>

      <div
        style={{
          marginTop: 20,
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 20,
        }}
      >
        <h3>General Settings</h3>
        <label style={{ display: 'block', marginTop: 10 }}>
          <input type='checkbox' /> Enable notifications
        </label>
        <label style={{ display: 'block', marginTop: 10 }}>
          <input type='checkbox' /> Dark mode
        </label>
        <label style={{ display: 'block', marginTop: 10 }}>
          <input type='checkbox' /> Auto-save
        </label>
      </div>
    </div>
  );
}
