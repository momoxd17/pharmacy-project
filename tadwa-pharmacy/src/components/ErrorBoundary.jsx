import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', maxWidth: 600, margin: '40px auto' }}>
          <h1 style={{ color: '#dc2626', marginBottom: 16 }}>حدث خطأ</h1>
          <pre style={{ background: '#fef2f2', padding: 16, overflow: 'auto', fontSize: 12 }}>
            {this.state.error.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: '8px 16px', cursor: 'pointer' }}
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
