export default function AdminLoading() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 60,
        color: '#6b7280',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: '4px solid #e5e7eb',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <p style={{ marginTop: 16 }}>Loading admin panel...</p>

      <div
        style={{
          marginTop: 20,
          padding: 16,
          backgroundColor: '#f0f9ff',
          borderRadius: 8,
          border: '1px solid #bae6fd',
          fontSize: 13,
        }}
      >
        <strong>Example:</strong> <code>modules/admin/pages/_loading.tsx</code>
        <br />
        Replaces default Suspense fallback for <strong>/admin/*</strong> routes.
      </div>
    </div>
  );
}
