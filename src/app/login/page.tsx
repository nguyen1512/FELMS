import type { CSSProperties } from "react";

type Props = {
  searchParams?: Promise<{
    redirect?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;

  const redirect = params?.redirect || "";
  const error = params?.error || "";

  return (
    <main style={styles.page}>
      <div style={styles.topCircle} />
      <div style={styles.bottomCircle} />

      <section style={styles.card}>
        <div style={styles.logoBox}>🎓</div>

        <h1 style={styles.title}>Đăng nhập</h1>

        <p style={styles.subtitle}>Chào mừng bạn quay trở lại ANU LMS</p>

        {error && (
          <div style={styles.errorBox}>
            {decodeURIComponent(error)}
          </div>
        )}

        <form action="/api/login" method="POST" style={styles.form}>
          <input type="hidden" name="redirect" value={redirect} />

          <div style={styles.field}>
            <label style={styles.label}>Email</label>

            <div style={styles.inputWrapper}>
              <span style={styles.icon}>✉</span>

              <input
                type="email"
                name="email"
                defaultValue="admin@anu-lms.vn"
                style={styles.input}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Mật khẩu</label>

            <div style={styles.inputWrapper}>
              <span style={styles.icon}>🔒</span>

              <input
                type="password"
                name="password"
                defaultValue="Admin@123"
                style={styles.input}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button type="submit" style={styles.loginButton}>
            Đăng nhập
          </button>
        </form>

        <p style={styles.note}>
          Tài khoản được quản lý bởi Ban quản trị hệ thống
        </p>

        <p style={styles.footer}>© 2026 ANU LMS Internal Platform</p>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg,#fff7ed 0%,#fffaf5 50%,#ffedd5 100%)",
    position: "relative",
    overflow: "hidden",
    padding: 24,
    fontFamily: 'Inter, Arial, "Segoe UI", system-ui, sans-serif',
  },

  topCircle: {
    position: "absolute",
    top: -120,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#ff6a00,#ff9500)",
    pointerEvents: "none",
    zIndex: 0,
  },

  bottomCircle: {
    position: "absolute",
    bottom: -150,
    right: -150,
    width: 380,
    height: 380,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#ff7a00,#ff9f1a)",
    pointerEvents: "none",
    zIndex: 0,
  },

  card: {
    width: 430,
    maxWidth: "100%",
    background: "rgba(255,255,255,0.96)",
    borderRadius: 34,
    padding: "42px 36px",
    boxShadow: "0 25px 80px rgba(255,115,0,0.20)",
    position: "relative",
    zIndex: 10,
    textAlign: "center",
  },

  logoBox: {
    width: 86,
    height: 86,
    borderRadius: 24,
    margin: "0 auto 24px",
    background: "linear-gradient(135deg,#ff6a00,#ffb36b)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 40,
    boxShadow: "0 16px 35px rgba(255,106,0,0.35)",
  },

  title: {
    margin: 0,
    fontSize: 56,
    fontWeight: 900,
    color: "#0f172a",
    lineHeight: 1,
  },

  subtitle: {
    marginTop: 14,
    marginBottom: 34,
    color: "#64748b",
    fontSize: 18,
  },

  errorBox: {
    marginBottom: 18,
    padding: "12px 14px",
    borderRadius: 14,
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    fontSize: 14,
    fontWeight: 700,
    textAlign: "left",
  },

  form: {
    width: "100%",
  },

  field: {
    marginBottom: 22,
    textAlign: "left",
  },

  label: {
    display: "block",
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 800,
    color: "#0f172a",
  },

  inputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    height: 62,
    borderRadius: 18,
    border: "1.5px solid #fed7aa",
    background: "#fff",
    padding: "0 18px",
  },

  icon: {
    fontSize: 20,
    color: "#ff6a00",
  },

  input: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 17,
    background: "transparent",
    color: "#0f172a",
  },

  loginButton: {
    width: "100%",
    height: 62,
    border: "none",
    borderRadius: 18,
    background: "linear-gradient(135deg,#ff6a00,#ff7a1a)",
    color: "#fff",
    fontSize: 18,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 14px 28px rgba(255,106,0,0.28)",
  },

  note: {
    marginTop: 24,
    marginBottom: 0,
    color: "#64748b",
    fontSize: 14,
  },

  footer: {
    marginTop: 18,
    marginBottom: 0,
    color: "#94a3b8",
    fontSize: 13,
  },
};